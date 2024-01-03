using System.Text;

namespace AppBoxCore;

public sealed class TypeExpression : Expression
{
    internal TypeExpression() { }

    public TypeExpression(string typeName)
    {
        TypeName = typeName;
        GenericArguments = null;
    }

    public override ExpressionType Type => ExpressionType.TypeExpression;

    /// <summary>
    /// 包含Namespace的名称, eg: System.DateTime或者简称 eg: int
    /// </summary>
    public string TypeName { get; private set; } = null!;

    public TypeExpression[]? GenericArguments { get; private set; }

    public override Type GetRuntimeType(IExpressionContext ctx) => ctx.ResolveType(this);

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        sb.Append(TypeName.StartsWith("System.") ? TypeName.AsSpan(7) : TypeName);

        if (GenericArguments is { Length: > 0 })
            throw new NotImplementedException();
    }

    public override LinqExpression? ToLinqExpression(IExpressionContext ctx) => null;

    protected internal override void WriteTo(IOutputStream writer)
    {
        writer.WriteString(TypeName);
        writer.WriteTypeExpressionArray(GenericArguments);
    }

    protected internal override void ReadFrom(IInputStream reader)
    {
        TypeName = reader.ReadString()!;
        GenericArguments = reader.ReadTypeExpressionArray();
    }
}