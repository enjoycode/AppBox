using System.Text;

namespace AppBoxCore;

public sealed class ConstantExpression : Expression
{
    /// <summary>
    /// Ctor for Serialization
    /// </summary>
    internal ConstantExpression() { }

    public ConstantExpression(object? value, TypeExpression? convertedType = null)
    {
        //TODO: value is null must has convertedType
        Value = value;
        ConvertedType = convertedType;
    }

    public object? Value { get; private set; }

    public TypeExpression? ConvertedType { get; private set; }

    public override ExpressionType Type => ExpressionType.ConstantExpression;

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        if (Value == null)
        {
            sb.Append("null");
            return;
        }

        if (Value is bool boolean)
        {
            sb.Append(boolean ? "true" : "false");
            return;
        }

        if (Value is byte or sbyte or short or ushort or int or uint or double)
        {
            sb.Append(Value);
            return;
        }

        if (Value is float)
        {
            sb.Append(Value);
            sb.Append('f');
            return;
        }

        if (Value is decimal)
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

        if (Value is char)
        {
            sb.Append('\'');
            sb.Append(Value);
            sb.Append('\'');
            return;
        }

        if (Value is Guid || Value is DateTime)
        {
            //TODO:
            sb.AppendFormat("\"{0}\"", Value);
            return;
        }

        if (Value.GetType().IsEnum)
        {
            sb.Append((int)Value);
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
        Value = reader.Deserialize();
    }
}