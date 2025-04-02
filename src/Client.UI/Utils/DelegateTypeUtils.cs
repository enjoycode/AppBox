using System.Reflection;

namespace AppBoxClient.Utils;

public static class DelegateTypeUtils
{
    public static Type[] GetDelegateParameterTypes(Type d)
    {
        if (d.BaseType != typeof(MulticastDelegate))
            throw new ArgumentException("Not a delegate.", nameof(d));

        var invoke = d.GetMethod("Invoke");
        if (invoke == null)
            throw new ArgumentException("Not a delegate.", nameof(d));

        ParameterInfo[] parameters = invoke.GetParameters();
        Type[] typeParameters = new Type[parameters.Length];
        for (int i = 0; i < parameters.Length; i++)
        {
            typeParameters[i] = parameters[i].ParameterType;
        }
        return typeParameters;
    }

    public static Type GetDelegateReturnType(Type d)
    {
        if (d.BaseType != typeof(MulticastDelegate))
            throw new ArgumentException("Not a delegate.", nameof(d));

        var invoke = d.GetMethod("Invoke");
        if (invoke == null)
            throw new ArgumentException("Not a delegate.", nameof(d));

        return invoke.ReturnType;
    }
}