namespace AppBoxCore;

public sealed class ExpressionEvaluator : ExpressionVisitor<IExpressionEvalContext, AnyValue>
{
    protected override AnyValue VisitConstant(ConstantExpression constantExpression, IExpressionEvalContext context)
        => constantExpression.Value;
}