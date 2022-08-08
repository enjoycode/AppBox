namespace AppBoxCore;

[System.AttributeUsage(System.AttributeTargets.Method)]
internal sealed class InvocationInterceptorAttribute : System.Attribute
{
    public InvocationInterceptorAttribute(string name) {}
}