using System.Text.Json;
using System.Text.Json.Serialization;
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

public sealed class DynamicPrimitive : IDynamicPrimitive
{
    [JsonIgnore] private State? _runtimeState;
    [JsonIgnore] private object? _expressionValue;
    [JsonIgnore] private IDynamicContext? _cachedContext; //Only for Expression
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

    [JsonIgnore]
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

    #region ====Serialization====

    public void WriteTo(Utf8JsonWriter writer)
    {
        writer.WriteStartObject();

        var propName = Source switch
        {
            DynamicPrimitiveSource.Primitive => nameof(DynamicPrimitiveSource.Primitive),
            DynamicPrimitiveSource.Expression => nameof(DynamicPrimitiveSource.Expression),
            _ => throw new JsonException($"Unknown DynamicStateValueSource")
        };
        writer.WritePropertyName(propName);

        if (Source == DynamicPrimitiveSource.Expression)
            ExpressionSerialization.SerializeToJson(writer, _value as Expression);
        else
            JsonSerializer.Serialize(writer, _value);
        writer.WriteEndObject();
    }

    public void ReadFrom(ref Utf8JsonReader reader, DynamicState state)
    {
        reader.Read(); // {
        reader.Read(); // Source
        var sourceName = reader.GetString()!;
        Source = sourceName switch
        {
            nameof(DynamicPrimitiveSource.Primitive) => DynamicPrimitiveSource.Primitive,
            nameof(DynamicPrimitiveSource.Expression) => DynamicPrimitiveSource.Expression,
            _ => throw new JsonException($"Unknown ValueSource: [{sourceName}]")
        };

        if (Source == DynamicPrimitiveSource.Expression)
        {
            _value = ExpressionSerialization.DeserializeFromJson(ref reader);
        }
        else
        {
            var peekReader = reader; // maybe null when not AllowNull, eg: Value: {"Primitive": null}
            peekReader.Read();
            if (peekReader.TokenType != JsonTokenType.Null)
            {
                var valueType = state.GetTypeOfPrimitiveState();
                _value = JsonSerializer.Deserialize(ref reader, valueType);
            }
            else
            {
                reader.Read(); //null
            }
        }

        reader.Read(); // }
    }

    #endregion
}