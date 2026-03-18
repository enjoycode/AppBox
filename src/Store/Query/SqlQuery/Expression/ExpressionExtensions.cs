using AppBoxCore;

namespace AppBoxStore;

public static class ExpressionExtensions
{
    public static SqlSelectItemExpression As(this Expression exp, string aliasName) => new(exp, aliasName);

    //----以下两个暂放在这里----
    public static bool In<T>(this T source, IEnumerable<T> list) => list.Contains(source);

    public static bool NotIn<T>(this T source, IEnumerable<T> list) => !list.Contains(source);
}