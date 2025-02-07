using System.Linq.Expressions;
using System.Reflection;

namespace AppBoxDesign;

internal static class ExpressionBuilder
{
    public static Func<TType, TResult> MakePropertyGetter<TType, TResult>(string propertyName, bool needCast = false)
    {
        var type = typeof(TType);
        var propertyInfo = type.GetProperty(propertyName, BindingFlags.Instance | BindingFlags.NonPublic)!;
        var entity = Expression.Parameter(type);
        var getterCall = Expression.Call(entity, propertyInfo.GetMethod!);
        if (needCast)
        {
            var castToObject = Expression.Convert(getterCall, typeof(object));
            return (Func<TType, TResult>)Expression.Lambda(castToObject, entity).Compile();
        }
        else
        {
            return Expression.Lambda<Func<TType, TResult>>(getterCall, entity).Compile();
        }
    }
}