using AppBoxCore;

namespace AppBoxWebHost;

/// <summary>
/// 系统服务容器，启动时注册，不能动态添加移除
/// </summary>
internal static class SysServiceContainer
{
    private static readonly IService SystemService = new SystemService();

    internal static IService? TryGet(ReadOnlyMemory<char> serviceName)
    {
        if (serviceName.Span.SequenceEqual(nameof(SystemService)))
        {
            return SystemService;
        }

        return null;
    }
}