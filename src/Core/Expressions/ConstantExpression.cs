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
        _typeInfo = typeInfo ?? ExpressionTypeInfo.FromAnyValue(value);
    }

    public AnyValue Value { get; private set; }

    private ExpressionTypeInfo _typeInfo;
    public override ExpressionTypeInfo TypeInfo => _typeInfo;

    public override ExpressionType NodeType => ExpressionType.ConstantExpression;

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        //TODO: 以下待重写
        if (Value.IsEmpty)
        {
            sb.Append("null");
            return;
        }

        if (Value.Type == AnyValue.AnyValueType.Boolean)
        {
            sb.Append(Value.GetBool()!.Value ? "true" : "false");
            return;
        }

        if (Value.Type is AnyValue.AnyValueType.Byte
            or AnyValue.AnyValueType.Int16 or AnyValue.AnyValueType.Int32
            or AnyValue.AnyValueType.Int64 or AnyValue.AnyValueType.UInt16
            or AnyValue.AnyValueType.UInt32 or AnyValue.AnyValueType.UInt64
            or AnyValue.AnyValueType.Float or AnyValue.AnyValueType.Double
            or AnyValue.AnyValueType.Decimal)
        {
            sb.Append(Value);
            return;
        }

        if (Value.Type == AnyValue.AnyValueType.Float)
        {
            sb.Append(Value);
            sb.Append('f');
            return;
        }

        if (Value.Type == AnyValue.AnyValueType.Decimal)
        {
            sb.Append(Value);
            sb.Append('m');
            return;
        }

        if (Value.Type == AnyValue.AnyValueType.Char)
        {
            sb.Append('\'');
            sb.Append(Value);
            sb.Append('\'');
            return;
        }

        if (Value.Type is AnyValue.AnyValueType.Guid or AnyValue.AnyValueType.DateTime)
        {
            //TODO:
            sb.AppendFormat("\"{0}\"", Value);
            return;
        }

        if (Value.BoxedValue is string)
        {
            sb.Append('"');
            sb.Append(Value);
            sb.Append('"');
            return;
        }

        throw new NotSupportedException();
    }

    public override LinqExpression? ToLinqExpression(IExpressionContext ctx) =>
        TryLinqConvert(LinqExpression.Constant(Value.BoxedValue), TypeInfo, ctx);

    protected internal override void WriteTo(IOutputStream writer)
    {
        _typeInfo.WriteTo(writer);
        writer.Serialize(Value);
    }

    protected internal override void ReadFrom(IInputStream reader)
    {
        _typeInfo = ExpressionTypeInfo.ReadFrom(reader);
        Value = AnyValue.DeserializeFrom(reader);
    }
}