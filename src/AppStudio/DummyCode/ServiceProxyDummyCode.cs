using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppBoxCore
{
    [AttributeUsage(AttributeTargets.Method)]
    internal sealed class InvocationInterceptorAttribute : Attribute
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

        [AppBoxCore.InvocationInterceptor("CallService")]
        public static Task<bool> SavePermission(string modelId, IList<Guid>? ouids) => throw new Exception();
    }
}

