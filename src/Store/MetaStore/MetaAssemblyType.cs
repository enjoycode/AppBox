namespace AppBoxStore;

public enum MetaAssemblyType : byte
{
    /// <summary>
    /// 编译好的服务模型的运行时程序集
    /// </summary>
    Service = 0xA0,
    /// <summary>
    /// 保留的运行时视图模型的JS代码
    /// </summary>
    View = 0xA1,
    /// <summary>
    /// 打包编译好的运行时应用程序集
    /// </summary>
    Application = 0xA3,
    /// <summary>
    /// 运行时视图模型所依赖的所有程序集
    /// </summary>
    ViewAssemblies = 0xA5,
}