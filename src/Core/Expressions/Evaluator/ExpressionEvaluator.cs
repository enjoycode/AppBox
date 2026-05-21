namespace AppBoxCore;

public sealed partial class ExpressionEvaluator : ExpressionVisitor<ExpressionEvalContext, ValueTask<AnyValue>>
{
    protected override ValueTask<AnyValue> VisitConstant(ConstantExpression constantExpression,
        ExpressionEvalContext context) => new(constantExpression.Value);

    protected override ValueTask<AnyValue> VisitMethodCall(MethodCallExpression methodCallExpression,
        ExpressionEvalContext context)
    {
        // 测试编译表达式
        // var linqExpression = methodCallExpression.ToLinqExpression(ExpressionContext.Default)!;
        // if (linqExpression.Type != typeof(object))
        //     linqExpression = LinqExpression.Convert(linqExpression, typeof(object));
        // var lambda = LinqExpression.Lambda<Func<object?>>(linqExpression);
        // var compiled = lambda.Compile();
        // var result = compiled();
        // return new ValueTask<AnyValue>(AnyValue.From(result));

        if (methodCallExpression.Target is TypeExpression typeExpression)
        {
            var staticType = context.ResolveType(typeExpression);
            var methodInfo = GetMethodInfo(staticType, methodCallExpression, context);
            var args = GetMethodArgs(methodCallExpression, context);
            var result = methodInfo.Invoke(null, args);
            return new(AnyValue.From(result));
        }
        else
        {
            var target = Visit(methodCallExpression.Target, context).Result.BoxedValue!;
            var targetType = target.GetType();
            var methodInfo = GetMethodInfo(targetType, methodCallExpression, context);
            var args = GetMethodArgs(methodCallExpression, context);
            var result = methodInfo.Invoke(target, args);
            return new(AnyValue.From(result));
        }
    }

    protected override async ValueTask<AnyValue> VisitAwait(AwaitExpression awaitExpression,
        ExpressionEvalContext context)
    {
        var taskObj = Visit(awaitExpression.Expression, context).Result.BoxedValue!;
        var taskType = taskObj.GetType();
        if (taskType.IsValueType) //ValueTask or ValueTask<T>
        {
            taskObj = taskType.GetMethod("AsTask")!.Invoke(taskObj, null);
        }

        var task = (Task)taskObj!;
        await task;

        if (taskType.IsGenericType)
        {
            //表达式编译委托方式
            // var taskInstance = LinqExpression.Constant(task);
            // var resultMember = LinqExpression.Property(taskInstance, "Result");
            // var converter = LinqExpression.Convert(resultMember, typeof(object));
            // var lambda = LinqExpression.Lambda<Func<object?>>(converter);
            // var compiled = lambda.Compile();
            // Console.WriteLine(compiled());

            //反射调用方式
            var res = taskType.GetProperty("Result")!.GetValue(taskObj);
            return AnyValue.From(res);
        }

        return AnyValue.Empty;
    }
}