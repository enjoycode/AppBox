namespace AppBoxCore;

public static class ExpressionFactory
{
    private static readonly Dictionary<ExpressionType, Func<Expression>> Factories = new()
    {
        { ExpressionType.ConstantExpression, () => new ConstantExpression() },
        { ExpressionType.IndexExpression, () => new IndexExpression() },
        { ExpressionType.ParameterExpression, () => new ParameterExpression() },
        { ExpressionType.BinaryExpression, () => new BinaryExpression() },
        { ExpressionType.NewExpression, () => new NewExpression() },
        { ExpressionType.MemberExpression, () => new MemberExpression() },
        { ExpressionType.MethodCallExpression, () => new MethodCallExpression() },
    };

    public static Expression Make(ExpressionType expressionType)
    {
        if (Factories.TryGetValue(expressionType, out var creator))
            return creator();

        throw new NotImplementedException();
    }
}