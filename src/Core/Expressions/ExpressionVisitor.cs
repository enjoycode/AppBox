namespace AppBoxCore;

public abstract class ExpressionVisitor<TContext, TResult>
{
    public TResult Visit(Expression expression, TContext context) => expression switch
    {
        ConstantExpression constantExpression => VisitConstant(constantExpression, context),
        BinaryExpression binaryExpression => VisitBinary(binaryExpression, context),
        MemberAccessExpression memberAccessExpression => VisitMemberAccess(memberAccessExpression, context),
        MethodCallExpression methodCallExpression => VisitMethodCall(methodCallExpression, context),
        NewExpression newExpression => VisitNew(newExpression, context),
        AwaitExpression awaitExpression => VisitAwait(awaitExpression, context),
        _ => throw new NotImplementedException()
    };

    protected virtual TResult VisitConstant(ConstantExpression constantExpression, TContext context)
        => throw new NotSupportedException();

    protected virtual TResult VisitBinary(BinaryExpression binaryExpression, TContext context)
        => throw new NotSupportedException();

    protected virtual TResult VisitMemberAccess(MemberAccessExpression memberAccessExpression, TContext context)
        => throw new NotSupportedException();

    protected virtual TResult VisitMethodCall(MethodCallExpression methodCallExpression, TContext context)
        => throw new NotSupportedException();

    protected virtual TResult VisitNew(NewExpression newExpression, TContext context)
        => throw new NotSupportedException();

    protected virtual TResult VisitAwait(AwaitExpression awaitExpression, TContext context)
        => throw new NotSupportedException();
}