using AppBoxCore;

namespace AppBoxServer;

/// <summary>
/// 系统服务容器，启动时注册，不能动态添加移除
/// </summary>
internal static class SysServiceContainer
{
    internal static readonly SystemService SystemService = new();
    internal static readonly DesignService DesignService = new();

    internal static IService? TryGet(ReadOnlyMemory<char> serviceName)
    {
        return serviceName.Span switch
        {
            nameof(SystemService) => SystemService,
            nameof(DesignService) => DesignService,
            _ => null
        };
    }
}