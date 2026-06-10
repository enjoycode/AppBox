using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Reflection;

namespace AppBoxCore;

partial class ExpressionEvaluator
{
    private AnyValue ConvertTo(AnyValue value, ExpressionTypeInfo toType)
    {
        var resultType = ResolveType(toType);
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
            AnyValue.ValueType.Int32 => AnyValue.From(left.GetInt()!.Value + right.GetInt()!.Value),
            AnyValue.ValueType.Double => AnyValue.From(left.GetDouble()!.Value + right.GetDouble()!.Value),
            _ => throw new NotImplementedException()
        };
    }

    private static AnyValue BinarySubtract(AnyValue left, AnyValue right)
    {
        return left.Type switch
        {
            AnyValue.ValueType.Int32 => AnyValue.From(left.GetInt()!.Value - right.GetInt()!.Value),
            AnyValue.ValueType.Double => AnyValue.From(left.GetDouble()!.Value - right.GetDouble()!.Value),
            _ => throw new NotImplementedException()
        };
    }

    private static AnyValue BinaryMultiply(AnyValue left, AnyValue right)
    {
        return left.Type switch
        {
            AnyValue.ValueType.Int32 => AnyValue.From(left.GetInt()!.Value * right.GetInt()!.Value),
            AnyValue.ValueType.Double => AnyValue.From(left.GetDouble()!.Value * right.GetDouble()!.Value),
            _ => throw new NotImplementedException()
        };
    }

    private static AnyValue BinaryDivide(AnyValue left, AnyValue right)
    {
        return left.Type switch
        {
            AnyValue.ValueType.Int32 => AnyValue.From(left.GetInt()!.Value / right.GetInt()!.Value),
            AnyValue.ValueType.Double => AnyValue.From(left.GetDouble()!.Value / right.GetDouble()!.Value),
            _ => throw new NotImplementedException()
        };
    }

    private static AnyValue BinaryGreaterThan(AnyValue left, AnyValue right)
    {
        return left.Type switch
        {
            AnyValue.ValueType.Int32 => left.GetInt()!.Value > right.GetInt()!.Value,
            AnyValue.ValueType.Double => left.GetDouble()!.Value > right.GetDouble()!.Value,
            _ => throw new NotImplementedException()
        };
    }

    private static AnyValue BinaryGreaterThanOrEqual(AnyValue left, AnyValue right)
    {
        return left.Type switch
        {
            AnyValue.ValueType.Int32 => left.GetInt()!.Value >= right.GetInt()!.Value,
            AnyValue.ValueType.Double => left.GetDouble()!.Value >= right.GetDouble()!.Value,
            _ => throw new NotImplementedException()
        };
    }

    private static AnyValue BinaryLessThan(AnyValue left, AnyValue right)
    {
        return left.Type switch
        {
            AnyValue.ValueType.Int32 => left.GetInt()!.Value < right.GetInt()!.Value,
            AnyValue.ValueType.Double => left.GetDouble()!.Value < right.GetDouble()!.Value,
            _ => throw new NotImplementedException()
        };
    }

    private static AnyValue BinaryLessThanOrEqual(AnyValue left, AnyValue right)
    {
        return left.Type switch
        {
            AnyValue.ValueType.Int32 => left.GetInt()!.Value <= right.GetInt()!.Value,
            AnyValue.ValueType.Double => left.GetDouble()!.Value <= right.GetDouble()!.Value,
            _ => throw new NotImplementedException()
        };
    }

    [SuppressMessage("ReSharper", "CompareOfFloatsByEqualityOperator")]
    private static AnyValue BinaryEqual(AnyValue left, AnyValue right)
    {
        return left.Type switch
        {
            AnyValue.ValueType.Int32 => left.GetInt()!.Value == right.GetInt()!.Value,
            AnyValue.ValueType.Double => left.GetDouble()!.Value == right.GetDouble()!.Value,
            _ => throw new NotImplementedException()
        };
    }

    private MethodInfo GetMethodInfo(Type type, MethodCallExpression methodCallExpression)
    {
        Type[] argTypes = Type.EmptyTypes;
        var genericParameterCount = methodCallExpression.IsGenericMethod
            ? methodCallExpression.GenericArguments!.Length
            : 0;

        if (methodCallExpression.Arguments is { Length: > 0 })
        {
            argTypes = new Type[methodCallExpression.Arguments.Length];
            for (var i = 0; i < argTypes.Length; i++)
            {
                if (!methodCallExpression.IsGenericMethod)
                {
                    var arg = methodCallExpression.Arguments[i];
                    Debug.Assert(!arg.TypeInfo.IsEmpty);
                    argTypes[i] = ResolveType(arg.TypeInfo);
                }
                else
                {
                    argTypes[i] = Type.MakeGenericMethodParameter(i);
                }
            }
        }

        var methodInfo = type.GetMethod(methodCallExpression.MethodName, genericParameterCount, argTypes);
        if (methodInfo == null)
            throw new Exception($"Can't find method for {type.Name}.{methodCallExpression.MethodName}");

        if (methodCallExpression.IsGenericMethod)
        {
            var genericTypes = new Type[methodCallExpression.GenericArguments!.Length];
            for (var i = 0; i < genericTypes.Length; i++)
            {
                genericTypes[i] = ResolveType(methodCallExpression.GenericArguments[i]);
            }

            methodInfo = methodInfo.MakeGenericMethod(genericTypes);
        }

        return methodInfo;
    }

    private object?[]? GetMethodArgs(MethodCallExpression methodCallExpression)
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
                args[i] = Visit(arg).Result.BoxedValue;
            }
        }

        return args;
    }
}