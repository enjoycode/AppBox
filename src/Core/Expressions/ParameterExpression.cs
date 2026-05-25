using System.Text;

namespace AppBoxCore;

public sealed class ParameterExpression : Expression
{
    internal ParameterExpression() { }

    internal ParameterExpression(string name, ExpressionTypeInfo type)
    {
        if (string.IsNullOrEmpty(name))
            throw new ArgumentNullException(nameof(name));
        if (type.IsEmpty)
            throw new ArgumentException("Type must not be empty", nameof(type));

        Name = name;
        _typeInfo = type;
    }

    public string Name { get; private set; } = null!;
    private ExpressionTypeInfo _typeInfo;
    public override ExpressionTypeInfo TypeInfo => _typeInfo;

    public override ExpressionType NodeType => ExpressionType.ParameterExpression;

    public override LinqExpression ToLinqExpression(IExpressionContext ctx) =>
        LinqExpression.Parameter(ctx.ResolveType(_typeInfo), Name);

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        sb.Append(Name);
    }

    protected internal override void WriteTo(IOutputStream writer)
    {
        writer.WriteString(Name);
        _typeInfo.WriteTo(writer);
    }

    protected internal override void ReadFrom(IInputStream reader)
    {
        Name = reader.ReadString()!;
        _typeInfo = ExpressionTypeInfo.ReadFrom(reader);
    }
}