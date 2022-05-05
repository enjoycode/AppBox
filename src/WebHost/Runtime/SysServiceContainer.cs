using AppBoxCore;
using AppBoxDesign;

namespace AppBoxWebHost;

/// <summary>
/// 系统服务容器，启动时注册，不能动态添加移除
/// </summary>
internal static class SysServiceContainer
{
    internal static readonly SystemService SystemService = new SystemService();
    internal static readonly DesignService DesignService = new DesignService();

    internal static IService? TryGet(ReadOnlyMemory<char> serviceName)
    {
        if (serviceName.Span.SequenceEqual(nameof(SystemService)))
            return SystemService;
        if (serviceName.Span.SequenceEqual(nameof(DesignService)))
            return DesignService;

        return null;
    }
}