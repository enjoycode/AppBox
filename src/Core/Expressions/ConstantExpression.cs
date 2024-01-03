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

        if (Value is int || Value is decimal || Value is byte || Value is float)
        {
            sb.Append(Value);
            return;
        }

        if (Value is string || Value is char || Value is Guid || Value is DateTime)
        {
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

    public override Type GetRuntimeType(IExpressionContext ctx)
    {
        if (!IsNull(ConvertedType))
            return ctx.ResolveType(ConvertedType!);

        return Value == null ? typeof(object) : Value.GetType();
    }

    public override LinqExpression? ToLinqExpression(IExpressionContext ctx)
    {
        if (IsNull(ConvertedType))
            return LinqExpression.Constant(Value);
        return LinqExpression.Convert(LinqExpression.Constant(Value), ctx.ResolveType(ConvertedType!));
    }

    protected internal override void WriteTo(IOutputStream writer)
    {
        writer.Serialize(ConvertedType);
        writer.Serialize(Value);
    }

    protected internal override void ReadFrom(IInputStream reader)
    {
        ConvertedType = reader.Deserialize() as TypeExpression;
        Value = reader.Deserialize();
    }
}