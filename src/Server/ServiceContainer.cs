using AppBoxCore;

namespace AppBoxServer;

/// <summary>
/// 服务模型运行时实例容器
/// </summary>
public static class ServiceContainer
{
    private struct ServiceInfo
    {
        public IService Instance;
        public ServiceAssemblyLoader Loader;
    }
}