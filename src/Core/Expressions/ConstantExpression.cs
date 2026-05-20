using System.Text;

namespace AppBoxCore;

public sealed class ConstantExpression : Expression
{
    /// <summary>
    /// Ctor for Serialization
    /// </summary>
    internal ConstantExpression() { }

    public ConstantExpression(AnyValue value, TypeExpression? convertedType = null)
    {
        //TODO: value is null must has convertedType
        Value = value;
        ConvertedType = convertedType;
    }

    public static ConstantExpression From(object? value, TypeExpression? convertedType = null)
    {
        if (value == null) return new ConstantExpression(AnyValue.Empty, convertedType);
        //TODO: others
        return value switch
        {
            bool boolValue => new ConstantExpression(boolValue, convertedType),
            byte byteValue => new ConstantExpression(byteValue, convertedType),
            char charValue => new ConstantExpression(charValue, convertedType),
            short shortValue => new ConstantExpression(shortValue, convertedType),
            int intValue => new ConstantExpression(intValue, convertedType),
            long longValue => new ConstantExpression(longValue, convertedType),
            float floatValue => new ConstantExpression(floatValue, convertedType),
            double doubleValue => new ConstantExpression(doubleValue, convertedType),
            decimal decimalValue => new ConstantExpression(decimalValue, convertedType),
            Guid guidValue => new ConstantExpression(guidValue, convertedType),
            DateTime dateTimeValue => new ConstantExpression(dateTimeValue, convertedType),
            _ => new ConstantExpression(AnyValue.From(value), convertedType)
        };
    }

    public AnyValue Value { get; private set; }

    public TypeExpression? ConvertedType { get; private set; }

    public override ExpressionType Type => ExpressionType.ConstantExpression;

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

        if (Value is string)
        {
            sb.Append('"');
            sb.Append(Value);
            sb.Append('"');
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

        throw new NotSupportedException();
    }

    public override LinqExpression? ToLinqExpression(IExpressionContext ctx) =>
        TryConvert(LinqExpression.Constant(Value), ConvertedType, ctx);

    protected internal override void WriteTo(IOutputStream writer)
    {
        writer.SerializeExpression(ConvertedType);
        writer.Serialize(Value);
    }

    protected internal override void ReadFrom(IInputStream reader)
    {
        ConvertedType = reader.Deserialize() as TypeExpression;
        Value = AnyValue.DeserializeFrom(reader);
    }
}