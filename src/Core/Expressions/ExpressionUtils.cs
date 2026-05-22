using System.Reflection;

namespace AppBoxCore;

internal static class ExpressionUtils
{
    public static readonly MethodInfo StringConcatMethod =
        typeof(string).GetMethod("Concat", [typeof(string), typeof(string)])!;
}