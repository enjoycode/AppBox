namespace AppBoxCore;

public static class ExpressionFactory
{
    private static readonly Dictionary<ExpressionType, Func<Expression>> dic = new()
    {
        { ExpressionType.ConstantExpression, () => new ConstantExpression() },
        { ExpressionType.NewExpression, () => new NewExpression() },
        { ExpressionType.TypeExpression, () => new TypeExpression() },
        { ExpressionType.MemberAccessExpression, () => new MemberAccessExpression() },
        { ExpressionType.MethodCallExpression, () => new MethodCallExpression() }
    };

    public static Expression Make(ExpressionType expressionType)
    {
        if (dic.TryGetValue(expressionType, out var creator))
            return creator();

        throw new NotImplementedException();
    }
}