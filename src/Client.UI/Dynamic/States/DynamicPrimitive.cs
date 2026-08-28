using AppBoxCore;

namespace PixUI.Dynamic;

public enum DynamicPrimitiveSource
{
    /// <summary>
    /// 常量值
    /// </summary>
    Primitive,

    /// <summary>
    /// 表达式值
    /// </summary>
    Expression
}

public sealed class DynamicPrimitive : IDynamicPrimitive, IBinSerializable
{
    private State? _runtimeState;
    private object? _expressionValue;
    private IDynamicContext? _cachedContext; //Only for Expression
    private object? _value;

    public DynamicPrimitiveSource Source { get; set; }

    /// <summary>
    /// 设计时状态值
    /// </summary>
    public object? Value
    {
        get => _value;
        set
        {
            //这里只会由设计时设置
            _value = value;
            if (_runtimeState != null)
            {
                if (Source == DynamicPrimitiveSource.Expression)
                    InitExpressionValue(_cachedContext!);
                _runtimeState.NotifyValueChanged();
            }
        }
    }

    private object? ProxyValue
    {
        get => Source == DynamicPrimitiveSource.Expression ? _expressionValue : _value;
        set
        {
            if (Source == DynamicPrimitiveSource.Expression)
                _expressionValue = value;
            else
                _value = value;
            _runtimeState?.NotifyValueChanged();
        }
    }

    /// <summary>
    /// 设置表达式值
    /// </summary>
    private void InitExpressionValue(IDynamicContext ctx)
    {
        _cachedContext = ctx;

        if (_value == null) return;
        if (_value is not Expression expression)
        {
            Notification.Error("状态值非表达式");
            return;
        }

        try
        {
            var body = expression.ToLinqExpression(ExpressionContext.Default)!;
            var convertedBody = System.Linq.Expressions.Expression.Convert(body, typeof(object));
            var lambda = System.Linq.Expressions.Expression.Lambda<Func<object?>>(convertedBody);
            var func = lambda.Compile();
            _expressionValue = func();
        }
        catch (Exception)
        {
            Notification.Error("无法编译表达式");
        }
    }

    public object? GetDesignValue(IDynamicContext ctx)
    {
        if (Source == DynamicPrimitiveSource.Expression && _expressionValue == null)
            InitExpressionValue(ctx);
        return ProxyValue;
    }

    public State GetRuntimeState(IDynamicContext ctx, DynamicState state)
    {
        if (_runtimeState != null) return _runtimeState;

        if (Source == DynamicPrimitiveSource.Expression)
            InitExpressionValue(ctx);

        //暂用RxProxy<>包装Value,考虑根据上下文确定运行时使用RxValue<>
        _runtimeState = state.Type switch
        {
            DynamicStateType.String => new RxProxy<string>(() => (ProxyValue as string) ?? string.Empty,
                v => ProxyValue = v),
            DynamicStateType.Int => (state.AllowNull
                ? new RxProxy<int?>(() => (int?)ProxyValue, v => ProxyValue = v)
                : new RxProxy<int>(() => ProxyValue == null ? 0 : (int)ProxyValue, v => ProxyValue = v)),
            DynamicStateType.DateTime => (state.AllowNull
                ? new RxProxy<DateTime?>(() => (DateTime?)ProxyValue, v => ProxyValue = v)
                : new RxProxy<DateTime>(() => ProxyValue == null ? default : (DateTime)ProxyValue,
                    v => ProxyValue = v)),
            _ => throw new NotImplementedException()
        };

        return _runtimeState;
    }

    public void CopyFrom(IDynamicContext otherCtx, DynamicState otherState)
    {
        if (Source == DynamicPrimitiveSource.Expression)
            throw new NotSupportedException("Can't copy to Expression");
        if (otherState.Value is not IDynamicPrimitive otherPrimitive)
            throw new NotSupportedException($"{nameof(DynamicPrimitive)} cannot copy from other: {otherState.Type}");

        var otherRuntimeState = otherPrimitive.GetRuntimeState(otherCtx, otherState);
        _value = otherRuntimeState.BoxedValue;
        //这里暂不通知值更新
    }

    public void NotifyStateChanged()
    {
        _runtimeState?.NotifyValueChanged();
    }

    #region ====Serialization====

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteByte((byte)Source);
        if (Source == DynamicPrimitiveSource.Expression)
            ws.SerializeExpression(_value as Expression);
        else
            ws.Serialize(_value);
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        Source = (DynamicPrimitiveSource)rs.ReadByte();
        _value = rs.Deserialize();
    }

    #endregion
}