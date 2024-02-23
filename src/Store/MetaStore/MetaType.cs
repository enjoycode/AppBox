namespace AppBoxStore;

public static class MetaType
{
    //以下常量跟内置存储的MetaCF内的Key前缀一致
    public const byte Meta_Application = 0x0C;
    public const byte Meta_Model = 0x0D;
    public const byte Meta_Code = 0x0E;

    public const byte Meta_Folder = 0x0F;
    //public const byte Meta_Service_Assembly = 0xA0;
    //public const byte Meta_View_Assembly = 0xA1;
    //public const byte Meta_App_Assembly = 0xA3;

    public const byte Meta_View_Router = 0xA2;

    public const byte Meta_App_Model_Dev_Counter = 0xAC;
    public const byte Meta_App_Model_Usr_Counter = 0xAD;

    public const byte ModelType_Application = 100;
    public const byte ModelType_Folder = 101;
}

public enum MetaAssemblyType : byte
{
    /// <summary>
    /// 编译好的服务模型的运行时程序集
    /// </summary>
    Service = 0xA0, //160

    /// <summary>
    /// 保留的运行时视图模型的JS代码
    /// </summary>
    ViewJS = 0xA1, //161
    
    /// <summary>
    /// 服务模型所依赖的外部程序集
    /// </summary>
    ExtService = 0xA2, //162

    /// <summary>
    /// 编译好的客户端(Blazor及桌面)应用程序集,包括编译好的视图模型、视图模型依赖的实体模型
    /// </summary>
    ClientApp = 0xA3, //163
    
    /// <summary>
    /// 客户端应用依赖的外部程序集
    /// </summary>
    ExtClient = 0xA4, //164

    /// <summary>
    /// 客户端运行时视图模型所依赖的所有程序集的名称列表
    /// </summary>
    /// <remarks> eg: ["A","B","sys.NewtonSoft.Json.dll"] </remarks>
    ViewAssemblies = 0xA5, //165
}

/// <summary>
/// 程序集附加标记
/// </summary>
public enum AssemblyFlag : byte
{
    /// <summary>
    /// 未指定，一般指DotNet托管程序集
    /// </summary>
    None,

    /// <summary>
    /// 平台原生程序集，通过扩展名区分对应的平台
    /// </summary>
    Native = 3,

    /// <summary>
    /// 可以注册为动态组件的视图程序集,用于动态视图设计器注册至工具箱
    /// </summary>
    ViewDynamic = 5,
}