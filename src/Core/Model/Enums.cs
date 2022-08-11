namespace AppBoxCore;

public enum ModelLayer : byte
{
    /// <summary>
    /// 系统层
    /// </summary>
    SYS = 0,

    /// <summary>
    /// 开发层
    /// </summary>
    DEV = 1,

    /// <summary>
    /// 用户层
    /// </summary>
    USR = 2
}

/// <summary>
/// 模型类型
/// </summary>
public enum ModelType : byte
{
    //注意顺序且无间隙
    Entity = 0,
    Service = 1,
    View = 2,
    Workflow = 3,
    Report = 4,
    Enum = 5,
    Event = 6,
    Permission = 7,
}

/// <summary>
/// 实体成员的类型
/// </summary>
public enum EntityMemberType : byte
{
    EntityField,
    EntityRef = 2,
    EntitySet = 3,
}

public enum EntityFieldType : byte
{
    EntityId = 0,
    String = 1,
    DateTime = 2,
    Short = 4,
    Int = 6,
    Long = 8,
    Decimal = 9,
    Bool = 10,
    Guid = 11,
    Byte = 12,
    Binary = 13,
    Enum = 14,
    Float = 15,
    Double = 16,
}

/// <summary>
/// 第三方组件所适用的平台
/// </summary>
public enum AssemblyPlatform : byte
{
    Common,
    Linux,
    Windows,
    MacOS,
}