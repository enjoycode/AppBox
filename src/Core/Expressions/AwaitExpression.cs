using System.Text;

namespace AppBoxCore;

public sealed class AwaitExpression : Expression
{
    public AwaitExpression(Expression expression)
    {
        Expression = expression;
    }

    public override ExpressionType Type => ExpressionType.AwaitExpression;

    public Expression Expression { get; }

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        throw new NotImplementedException();
    }
}