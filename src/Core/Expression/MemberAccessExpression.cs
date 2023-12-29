using System.Reflection;
using System.Text;

namespace AppBoxCore;

public sealed class MemberAccessExpression : Expression
{
    internal MemberAccessExpression() { }

    public MemberAccessExpression(Expression expression, string memberName, bool isField)
    {
        Expression = expression;
        MemberName = memberName;
        IsField = isField;
    }

    public override ExpressionType Type => ExpressionType.MemberAccessExpression;

    public Expression Expression { get; } = null!;

    public string MemberName { get; } = null!;

    public bool IsField { get; }

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        Expression.ToCode(sb, preTabs);
        sb.Append('.');
        sb.Append(MemberName);
    }

    public override LinqExpression? ToLinqExpression(IExpressionContext ctx)
    {
        var type = Expression.GetRuntimeType(ctx);
        MemberInfo? memberInfo = IsField ? type.GetField(MemberName) : type.GetProperty(MemberName);
        if (memberInfo == null)
            throw new Exception($"Can't find member: {type.FullName}.{MemberName}");

        return LinqExpression.MakeMemberAccess(Expression.ToLinqExpression(ctx), memberInfo);
    }
}