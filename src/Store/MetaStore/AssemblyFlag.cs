namespace AppBoxStore;

/// <summary>
/// 程序集标记，用于标记第三方组件所适用的平台或视图模型的类型
/// </summary>
public enum AssemblyFlag : byte
{
    PlatformAll,
    PlatformLinux,
    PlatformWindows,
    PlatformMacOS,
    
    ViewAssemblyNormal,
    ViewAssemblyDynamic,
}