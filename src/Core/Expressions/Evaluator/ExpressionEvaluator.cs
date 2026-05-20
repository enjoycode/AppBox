namespace AppBoxCore;

public sealed class ExpressionEvaluator : ExpressionVisitor<ExpressionEvalContext, ValueTask<AnyValue>>
{
    protected override ValueTask<AnyValue> VisitConstant(ConstantExpression constantExpression,
        ExpressionEvalContext context) => new(constantExpression.Value);

    protected override ValueTask<AnyValue> VisitMethodCall(MethodCallExpression methodCallExpression,
        ExpressionEvalContext context)
    {
        //TODO:测试
        var linqExpression = methodCallExpression.ToLinqExpression(ExpressionContext.Default)!;
        if (linqExpression.Type != typeof(object))
            linqExpression = LinqExpression.Convert(linqExpression, typeof(object));
        var lambda = LinqExpression.Lambda<Func<object?>>(linqExpression);
        var compiled = lambda.Compile();
        var result = compiled();
        return new(AnyValue.From(result));
    }

    protected override async ValueTask<AnyValue> VisitAwait(AwaitExpression awaitExpression,
        ExpressionEvalContext context)
    {
        var task = Visit(awaitExpression.Expression, context).Result.BoxedValue!;
        var taskType = task.GetType();
        if (task is Task t)
        {
            await t;
            if (taskType.IsGenericType)
            {
                var taskInstance = LinqExpression.Constant(task);
                var resultMember = LinqExpression.Property(taskInstance, "Result");
                var converter = LinqExpression.Convert(resultMember, typeof(object));
                var lambda = LinqExpression.Lambda<Func<object?>>(converter);
                var compiled = lambda.Compile();
                Console.WriteLine(compiled());
            }
        }

        return AnyValue.Empty;
    }
}