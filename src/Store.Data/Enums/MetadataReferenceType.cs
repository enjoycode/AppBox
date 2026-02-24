namespace AppBoxStore;

/// <summary>
/// MetadataReference的类型
/// </summary>
internal enum MetadataReferenceType : byte
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