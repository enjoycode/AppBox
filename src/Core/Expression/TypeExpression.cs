using System.Text;

namespace AppBoxCore;

public sealed class TypeExpression : Expression
{
    internal TypeExpression() { }

    public TypeExpression(string typeFullName)
    {
        TypeFullName = typeFullName;
        GenericArguments = null;
    }

    public override ExpressionType Type => ExpressionType.TypeExpression;

    /// <summary>
    /// 包含Namespace的名称, eg: System.DateTime
    /// </summary>
    public string TypeFullName { get; }

    public TypeExpression[]? GenericArguments { get; }

    public override Type GetRuntimeType(IExpressionContext ctx) => ctx.ResolveType(this);

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        sb.Append(TypeFullName.StartsWith("System.") ? TypeFullName.AsSpan(7) : TypeFullName);

        if (GenericArguments is { Length: > 0 })
            throw new NotImplementedException();
    }

    public override LinqExpression? ToLinqExpression(IExpressionContext ctx) => null;
}