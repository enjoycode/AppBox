using System.Text;

namespace AppBoxCore;

public sealed class ConstantExpression : Expression
{
    /// <summary>
    /// Ctor for Serialization
    /// </summary>
    internal ConstantExpression() { }

    internal ConstantExpression(AnyValue value, ExpressionTypeInfo? typeInfo = null)
    {
        Value = value;
        _typeInfo = typeInfo ?? new(value);
    }

    public AnyValue Value { get; private set; }

    private ExpressionTypeInfo _typeInfo;
    public override ExpressionTypeInfo TypeInfo => _typeInfo;

    public override ExpressionType NodeType => ExpressionType.ConstantExpression;

    public override void ToCode(IExpressionCodeBuilder builder)
    {
        var sb = builder.StringBuilder;
        //TODO: 以下待重写
        if (Value.IsEmpty)
        {
            sb.Append("null");
            return;
        }

        if (Value.Type == AnyValue.ValueType.Boolean)
        {
            sb.Append(Value.GetBool()!.Value ? "true" : "false");
            return;
        }

        if (Value.Type is AnyValue.ValueType.Byte
            or AnyValue.ValueType.Int16 or AnyValue.ValueType.Int32
            or AnyValue.ValueType.Int64 or AnyValue.ValueType.UInt16
            or AnyValue.ValueType.UInt32 or AnyValue.ValueType.UInt64
            or AnyValue.ValueType.Float or AnyValue.ValueType.Double
            or AnyValue.ValueType.Decimal)
        {
            sb.Append(Value.BoxedValue);
            return;
        }

        if (Value.Type == AnyValue.ValueType.Float)
        {
            sb.Append(Value.GetFloat()!.Value);
            sb.Append('f');
            return;
        }

        if (Value.Type == AnyValue.ValueType.Decimal)
        {
            sb.Append(Value.GetDecimal()!.Value);
            sb.Append('m');
            return;
        }

        if (Value.Type == AnyValue.ValueType.Char)
        {
            sb.Append('\'');
            sb.Append(Value.GetChar()!.Value);
            sb.Append('\'');
            return;
        }

        if (Value.Type is AnyValue.ValueType.Guid or AnyValue.ValueType.DateTime)
        {
            //TODO:
            sb.Append($"\"{Value.BoxedValue}\"");
            return;
        }

        if (Value.BoxedValue is string)
        {
            sb.Append('"');
            sb.Append(Value.BoxedValue);
            sb.Append('"');
            return;
        }

        throw new NotSupportedException();
    }

    public override LinqExpression ToLinqExpression(IExpressionContext ctx) =>
        TryLinqConvert(LinqExpression.Constant(Value.BoxedValue), TypeInfo, ctx);

    protected internal override void WriteTo<T>(ref T writer)
    {
        _typeInfo.WriteTo(ref writer);
        writer.Serialize(Value);
    }

    protected internal override void ReadFrom<T>(ref T reader)
    {
        _typeInfo = ExpressionTypeInfo.ReadFrom(ref reader);
        Value = AnyValue.DeserializeFrom(ref reader);
    }
}