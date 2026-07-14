namespace AppBoxCore;

public sealed class AwaitExpression : Expression
{
    public AwaitExpression(Expression expression)
    {
        Expression = expression;
    }

    public override ExpressionType NodeType => ExpressionType.AwaitExpression;

    public Expression Expression { get; }

    public override void ToCode(IExpressionCodeBuilder builder)
    {
        var sb = builder.StringBuilder;
        sb.Append("await ");
        Expression.ToCode(builder);
    }
}