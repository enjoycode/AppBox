namespace AppBoxCore;

public abstract class ExpressionVisitor<TResult>
{
    public TResult Visit(Expression expression) => expression switch
    {
        ConstantExpression constantExpression => VisitConstant(constantExpression),
        ParameterExpression parameterExpression => VisitParameter(parameterExpression),
        BinaryExpression binaryExpression => VisitBinary(binaryExpression),
        MemberExpression memberAccessExpression => VisitMemberAccess(memberAccessExpression),
        IndexExpression indexExpression => VisitIndex(indexExpression),
        MethodCallExpression methodCallExpression => VisitMethodCall(methodCallExpression),
        NewExpression newExpression => VisitNew(newExpression),
        AwaitExpression awaitExpression => VisitAwait(awaitExpression),
        null => throw new ArgumentNullException(nameof(expression)),
        _ => throw new NotImplementedException($"ExpressionVisitor visit {expression.GetType().Name} not implemented")
    };

    protected virtual TResult VisitConstant(ConstantExpression constantExpression)
        => throw new NotSupportedException();

    protected virtual TResult VisitParameter(ParameterExpression parameterExpression)
        => throw new NotSupportedException();

    protected virtual TResult VisitBinary(BinaryExpression binaryExpression)
        => throw new NotSupportedException();

    protected virtual TResult VisitMemberAccess(MemberExpression memberExpression)
        => throw new NotSupportedException();

    protected virtual TResult VisitIndex(IndexExpression indexExpression)
        => throw new NotSupportedException();

    protected virtual TResult VisitMethodCall(MethodCallExpression methodCallExpression)
        => throw new NotSupportedException();

    protected virtual TResult VisitNew(NewExpression newExpression)
        => throw new NotSupportedException();

    protected virtual TResult VisitAwait(AwaitExpression awaitExpression)
        => throw new NotSupportedException();
}