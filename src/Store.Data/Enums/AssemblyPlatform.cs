namespace AppBoxCore;

/// <summary>
/// 程序集适用的平台
/// </summary>
public enum AssemblyPlatform : byte
{
    /// <summary>
    /// 未指定，一般指DotNet托管程序集
    /// </summary>
    None,
    
    /// <summary>
    /// MacOS平台原生程序集
    /// </summary>
    MacOSNative = 2,

    /// <summary>
    /// Linux平台原生程序集
    /// </summary>
    LinuxNative = 3,

    /// <summary>
    /// Windows平台原生程序集
    /// </summary>
    WindowsNative = 4,

    /// <summary>
    /// 可以注册为动态组件的视图程序集,用于动态视图设计器注册至工具箱
    /// </summary>
    ViewDynamic = 5,
}