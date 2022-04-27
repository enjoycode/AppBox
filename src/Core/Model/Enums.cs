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
    Enum = 1,
    Entity = 2,
    Event = 3,
    Service = 4,
    View = 5,
    Workflow = 6,
    Report = 7,
    Folder = 8,
    Permission = 9,
}