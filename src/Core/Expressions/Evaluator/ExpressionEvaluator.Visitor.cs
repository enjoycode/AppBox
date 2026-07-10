namespace AppBoxCore;

public sealed partial class ExpressionEvaluator : ExpressionVisitor<ValueTask<AnyValue>>
{
    protected override ValueTask<AnyValue> VisitConstant(ConstantExpression constantExpression) =>
        constantExpression.TypeInfo.IsConverted
            ? new ValueTask<AnyValue>(ConvertTo(constantExpression.Value, constantExpression.TypeInfo))
            : new ValueTask<AnyValue>(constantExpression.Value);

    protected override ValueTask<AnyValue> VisitParameter(ParameterExpression parameterExpression) =>
        new(ResolveParameter(parameterExpression.Name));

    protected override async ValueTask<AnyValue> VisitMemberAccess(MemberExpression memberExpression)
    {
        var memberName = memberExpression.MemberName;
        var isField = memberExpression.IsField;
        if (memberExpression.IsStaticMemberAccess)
        {
            var staticType = ResolveType(memberExpression.StaticType);
            if (isField)
            {
                var fieldInfo = staticType.GetField(memberName)!;
                return AnyValue.From(fieldInfo.GetValue(null));
            }

            var propInfo = staticType.GetProperty(memberName)!;
            return AnyValue.From(propInfo.GetValue(null));
        }
        else
        {
            var instance = await Visit(memberExpression.Instance!);
            if (instance.IsEmpty) throw new NullReferenceException();
            var instanceType = instance.GetRuntimeType();
            //TODO:特殊处理EntityData的属性访问
            if (isField)
            {
                var fieldInfo = instanceType.GetField(memberName)!;
                return AnyValue.From(fieldInfo.GetValue(instance.BoxedValue));
            }

            var propInfo = instanceType.GetProperty(memberName)!;
            return AnyValue.From(propInfo.GetValue(instance.BoxedValue));
        }
    }

    protected override async ValueTask<AnyValue> VisitIndex(IndexExpression indexExpression)
    {
        if (indexExpression.IsStatic || indexExpression.IsArray)
            throw new NotImplementedException();

        var instance = await Visit(indexExpression.Instance!);
        var instanceType = instance.GetRuntimeType();
        var args = new object?[indexExpression.Arguments.Length];
        var argTypes = new Type[indexExpression.Arguments.Length];
        for (var i = 0; i < args.Length; i++)
        {
            args[i] = (await Visit(indexExpression.Arguments[i])).BoxedValue;
            argTypes[i] = ResolveType(indexExpression.Arguments[i].TypeInfo);
        }

        var indexer = instanceType.GetProperty(indexExpression.IndexerName, argTypes)!;
        return AnyValue.From(indexer.GetValue(instance.BoxedValue, args));
    }

    protected override async ValueTask<AnyValue> VisitBinary(BinaryExpression binaryExpression)
    {
        var leftValue = await Visit(binaryExpression.LeftOperand);
        var rightValue = await Visit(binaryExpression.RightOperand);
        var result = binaryExpression.BinaryType switch
        {
            BinaryOperatorType.Add => BinaryAdd(leftValue, rightValue),
            BinaryOperatorType.Subtract => BinarySubtract(leftValue, rightValue),
            BinaryOperatorType.Multiply => BinaryMultiply(leftValue, rightValue),
            BinaryOperatorType.Divide => BinaryDivide(leftValue, rightValue),
            BinaryOperatorType.Greater => BinaryGreaterThan(leftValue, rightValue),
            BinaryOperatorType.GreaterOrEqual => BinaryGreaterThanOrEqual(leftValue, rightValue),
            BinaryOperatorType.Less => BinaryLessThan(leftValue, rightValue),
            BinaryOperatorType.LessOrEqual => BinaryLessThanOrEqual(leftValue, rightValue),
            BinaryOperatorType.Equal => BinaryEqual(leftValue, rightValue),
            _ => throw new NotImplementedException(binaryExpression.BinaryType.ToString())
        };
        return result;
    }

    protected override async ValueTask<AnyValue> VisitMethodCall(MethodCallExpression methodCallExpression)
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
            var staticType = ResolveType(methodCallExpression.StaticType);
            var methodInfo = GetMethodInfo(staticType, methodCallExpression);
            var args = GetMethodArgs(methodCallExpression);
            var result = methodInfo.Invoke(null, args);
            return AnyValue.From(result);
        }
        else
        {
            var target = (await Visit(methodCallExpression.Instance!)).BoxedValue!;
            var targetType = target.GetType();
            var methodInfo = GetMethodInfo(targetType, methodCallExpression);
            var args = GetMethodArgs(methodCallExpression);
            var result = methodInfo.Invoke(target, args);
            return AnyValue.From(result);
        }
    }

    protected override async ValueTask<AnyValue> VisitAwait(AwaitExpression awaitExpression)
    {
        var taskObj = (await Visit(awaitExpression.Expression)).BoxedValue!;
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