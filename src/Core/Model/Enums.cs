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