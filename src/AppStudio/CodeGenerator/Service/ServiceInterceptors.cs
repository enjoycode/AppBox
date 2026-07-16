namespace AppBoxDesign;

/// <summary>
/// 服务代码生成器的拦截器
/// </summary>
internal sealed class ServiceInterceptors : InterceptorManager
{
    public static readonly ServiceInterceptors Default = new();

    private ServiceInterceptors()
    {
        InvocationInterceptors.Add(CallServiceInterceptor.Name, CallServiceInterceptor.Default);
        InvocationInterceptors.Add(StartWorkflowInterceptor.Name, StartWorkflowInterceptor.Default);
        MemberAccessInterceptors.Add(PermissionAccessInterceptor.Name, PermissionAccessInterceptor.Default);
    }
}