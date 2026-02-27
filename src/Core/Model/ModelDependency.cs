namespace AppBoxCore;

/// <summary>
/// 模型依赖的类型
/// </summary>
public enum ModelDependencyType : byte
{
    /// <summary>
    /// DotNet组件
    /// </summary>
    SdkLibrary,

    /// <summary>
    /// 客户端与服务端通用组件
    /// </summary>
    CoreLibrary,

    /// <summary>
    /// 客户端组件
    /// </summary>
    ClientLibrary,

    /// <summary>
    /// 服务端组件
    /// </summary>
    ServerLibrary,

    /// <summary>
    /// 服务依赖的外部组件
    /// </summary>
    ServerExtLibrary,
}

/// <summary>
/// 模型的依赖项，比如服务模型依赖的第三方库
/// </summary>
public readonly struct ModelDependency : IEquatable<ModelDependency>
{
    public ModelDependencyType Type { get; init; }

    /// <summary>
    /// 依赖的组件名称 eg: NPoi.dll
    /// </summary>
    public string AssemblyName { get; init; }

    public bool Equals(ModelDependency other) => Type == other.Type && AssemblyName == other.AssemblyName;

    public override bool Equals(object? obj) => obj is ModelDependency other && Equals(other);

    public override int GetHashCode() => HashCode.Combine((int)Type, AssemblyName);
}