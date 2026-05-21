using System.Reflection;

namespace AppBoxCore;

partial class ExpressionEvaluator
{
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
        if (methodCallExpression.Arguments is { Length: > 0 })
        {
            args = new object?[methodCallExpression.Arguments.Length];
            for (var i = 0; i < args.Length; i++)
            {
                args[i] = Visit(methodCallExpression.Arguments[i], context).Result.BoxedValue;
            }
        }

        return args;
    }
}