namespace AppBoxCore;

public abstract class ExpressionVisitor<TResult>
{
    public TResult Visit(Expression expression) => expression switch
    {
        ConstantExpression constantExpression => VisitConstant(constantExpression),
        BinaryExpression binaryExpression => VisitBinary(binaryExpression),
        MemberAccessExpression memberAccessExpression => VisitMemberAccess(memberAccessExpression),
        MethodCallExpression methodCallExpression => VisitMethodCall(methodCallExpression),
        NewExpression newExpression => VisitNew(newExpression),
        AwaitExpression awaitExpression => VisitAwait(awaitExpression),
        null => throw new ArgumentNullException(nameof(expression)),
        _ => throw new NotImplementedException()
    };

    protected virtual TResult VisitConstant(ConstantExpression constantExpression)
        => throw new NotSupportedException();

    protected virtual TResult VisitBinary(BinaryExpression binaryExpression)
        => throw new NotSupportedException();

    protected virtual TResult VisitMemberAccess(MemberAccessExpression memberAccessExpression)
        => throw new NotSupportedException();

    protected virtual TResult VisitMethodCall(MethodCallExpression methodCallExpression)
        => throw new NotSupportedException();

    protected virtual TResult VisitNew(NewExpression newExpression)
        => throw new NotSupportedException();

    protected virtual TResult VisitAwait(AwaitExpression awaitExpression)
        => throw new NotSupportedException();
}