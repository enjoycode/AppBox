using System;

namespace AppBoxCore
{
    [AttributeUsage(AttributeTargets.Method)]
    public sealed class InvocationInterceptorAttribute : Attribute
    {
        public InvocationInterceptorAttribute(string name) {}
    }
}