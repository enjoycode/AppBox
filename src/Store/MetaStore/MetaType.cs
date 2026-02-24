namespace AppBoxStore;

public static class MetaType
{
    //以下常量跟内置存储的MetaCF内的Key前缀一致
    public const byte META_APPLICATION = 0x0C;
    public const byte META_MODEL = 0x0D;
    public const byte META_CODE = 0x0E;

    public const byte META_FOLDER = 0x0F;
    // public const byte META_SERVICE_ASSEMBLY = 0xA0;
    // public const byte META_VIEW_ASSEMBLY = 0xA1;
    // public const byte META_APP_ASSEMBLY = 0xA3;

    public const byte META_VIEW_ROUTER = 0xA2;

    public const byte META_APP_MODEL_DEV_COUNTER = 0xAC;
    public const byte META_APP_MODEL_USR_COUNTER = 0xAD;

    public const byte MODEL_TYPE_APPLICATION = 100;
    public const byte MODEL_TYPE_FOLDER = 101;
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