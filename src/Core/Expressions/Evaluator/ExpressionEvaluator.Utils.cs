using System.Reflection;

namespace AppBoxCore;

partial class ExpressionEvaluator
{
    private static AnyValue ConvertTo(AnyValue value, TypeExpression toType, ExpressionEvalContext context)
    {
        var resultType = context.ResolveType(toType);
        return resultType! switch
        {
            { } t when t == typeof(int) => value.ConvertToInt32(),
            { } t when t == typeof(double) => value.ConvertToDouble(),
            { } t when t == typeof(object) => value,
            _ => throw new NotImplementedException()
        };
    }

    private static AnyValue BinaryAdd(AnyValue left, AnyValue right)
    {
        return left.Type switch
        {
            AnyValue.AnyValueType.Int32 => left.GetInt()!.Value + right.GetInt()!.Value,
            AnyValue.AnyValueType.Double => left.GetDouble()!.Value + right.GetDouble()!.Value,
            _ => throw new NotImplementedException()
        };
    }

    private static MethodInfo GetMethodInfo(Type type, MethodCallExpression methodCallExpression,
        ExpressionEvalContext context)
    {
        var methodInfo = type.GetMethod(methodCallExpression.MethodName)!;
        if (methodCallExpression.GenericArguments is { Length: > 0 })
        {
            var genericTypes = new Type[methodCallExpression.GenericArguments.Length];
            for (var i = 0; i < genericTypes.Length; i++)
            {
                genericTypes[i] = context.ResolveType(methodCallExpression.GenericArguments[i]);
            }

            methodInfo = methodInfo.MakeGenericMethod(genericTypes);
        }

        return methodInfo;
    }

    private object?[]? GetMethodArgs(MethodCallExpression methodCallExpression, ExpressionEvalContext context)
    {
        object?[]? args = null;
        // types = [];
        if (methodCallExpression.Arguments is { Length: > 0 })
        {
            args = new object?[methodCallExpression.Arguments.Length];
            // types = new Type[methodCallExpression.Arguments.Length];
            for (var i = 0; i < args.Length; i++)
            {
                var arg = methodCallExpression.Arguments[i];
                args[i] = Visit(arg, context).Result.BoxedValue;
                
            }
        }

        return args;
    }
}