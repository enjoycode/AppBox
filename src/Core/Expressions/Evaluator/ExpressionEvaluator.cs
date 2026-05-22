namespace AppBoxCore;

public sealed partial class ExpressionEvaluator : ExpressionVisitor<ExpressionEvalContext, ValueTask<AnyValue>>
{
    protected override ValueTask<AnyValue> VisitConstant(ConstantExpression constantExpression,
        ExpressionEvalContext context) => constantExpression.TypeInfo.IsConverted
        ? new ValueTask<AnyValue>(ConvertTo(constantExpression.Value, constantExpression.TypeInfo, context))
        : new ValueTask<AnyValue>(constantExpression.Value);

    protected override ValueTask<AnyValue> VisitMemberAccess(MemberAccessExpression memberAccessExpression,
        ExpressionEvalContext context)
    {
        var memberName = memberAccessExpression.MemberName;
        var isField = memberAccessExpression.IsField;
        if (memberAccessExpression.IsStaticMemberAccess)
        {
            var staticType = context.ResolveType(memberAccessExpression.StaticType);
            if (isField)
            {
                var fieldInfo = staticType.GetField(memberName)!;
                return new ValueTask<AnyValue>(AnyValue.From(fieldInfo.GetValue(null)));
            }

            var propInfo = staticType.GetProperty(memberName)!;
            return new(AnyValue.From(propInfo.GetValue(null)));
        }
        else
        {
            var instance = Visit(memberAccessExpression.Instance!, context).Result;
            if (instance.IsEmpty) throw new NullReferenceException();
            var instanceType = instance.GetRuntimeType();
            if (isField)
            {
                var fieldInfo = instanceType.GetField(memberName)!;
                return new ValueTask<AnyValue>(AnyValue.From(fieldInfo.GetValue(instance)));
            }

            var propInfo = instanceType.GetField(memberName)!;
            return new(AnyValue.From(propInfo.GetValue(instance)));
        }
    }

    protected override ValueTask<AnyValue> VisitBinary(BinaryExpression binaryExpression, ExpressionEvalContext context)
    {
        var leftValue = Visit(binaryExpression.LeftOperand, context).Result;
        switch (binaryExpression.BinaryType)
        {
            case BinaryOperatorType.Add:
            {
                var rightValue = Visit(binaryExpression.RightOperand, context).Result;
                return new ValueTask<AnyValue>(BinaryAdd(leftValue, rightValue));
            }
            default:
                throw new NotImplementedException();
        }
    }

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

        if (methodCallExpression.IsStaticMethodCall)
        {
            var staticType = context.ResolveType(methodCallExpression.StaticType);
            var methodInfo = GetMethodInfo(staticType, methodCallExpression, context);
            var args = GetMethodArgs(methodCallExpression, context);
            var result = methodInfo.Invoke(null, args);
            return new(AnyValue.From(result));
        }
        else
        {
            var target = Visit(methodCallExpression.Instance!, context).Result.BoxedValue!;
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