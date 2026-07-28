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
    
    /// <summary>
    /// 标记服务方法为上传
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public sealed class UploadMethodAttribute : Attribute {}
    
    /// <summary>
    /// 标记服务方法为下载
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public sealed class DownloadMethodAttribute : Attribute {}
}

//====以下系统服务的代理类，方便前端调用====

namespace sys.Services
{
    public static class SystemService
    {
        [AppBoxCore.InvocationInterceptor("CallService")]
        public static Task<IList<AppBoxCore.PermissionNode>> LoadPermissionTree() => throw new Exception();

        [AppBoxCore.InvocationInterceptor("CallService")]
        public static Task<bool> SavePermission(string modelId, IList<Guid>? ouids) => throw new Exception();
    }
    
    public static class WorkflowService
    {
        [AppBoxCore.InvocationInterceptor("CallService")]
        public static Task<byte[]?> FetchParameters(Guid instanceId) => throw new Exception();
        
        [AppBoxCore.InvocationInterceptor("CallService")]
        public static Task<byte[]?> FetchTaskActions(Guid actorId, Guid instanceId, Guid bookmarkId) => throw new Exception();
        
        /// <summary>
        /// 人员操作恢复挂起的工作流实例
        /// </summary>
        [AppBoxCore.InvocationInterceptor("CallService")]
        public static Task Resume(Guid instanceId, Guid bookmarkId, string result, string? memo) => throw new Exception();
    }
}

