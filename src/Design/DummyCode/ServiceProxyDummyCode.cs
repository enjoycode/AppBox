namespace AppBoxCore
{
    [System.AttributeUsage(System.AttributeTargets.Method)]
    internal sealed class InvocationInterceptorAttribute : System.Attribute
    {
        public InvocationInterceptorAttribute(string name) {}
    }
}

//====以下系统服务的代理类，方便前端调用====

namespace sys.Services
{
    public class SystemService
    {
        [AppBoxCore.InvocationInterceptor("CallService")]
        public static Task<IList<AppBoxCore.PermissionNode>> LoadPermissionTree() => throw new Exception();
    }
}

