namespace AppBoxCore;

/// <summary>
/// 用户会话信息
/// </summary>
public interface IUserSession
{
    /// <summary>
    /// 用户名
    /// </summary>
    string Name { get; }

    /// <summary>
    /// 是否外部用户会话
    /// </summary>
    bool IsExternal { get; } //TODO:考虑改为会话类型，如：内部用户、外部用户、系统内置用户

    /// <summary>
    /// 附加会话标记，如SaaS外部用户的租户ID等
    /// </summary>
    string Tag { get; }

    /// <summary>
    /// 会话标识号，仅用于服务端会话管理
    /// </summary>
    ulong SessionId { get; }

    /// <summary>
    /// 当前会话用户的组织路径深度
    /// 注意：外部会话包含External一级
    /// </summary>
    int Levels { get; }

    /// <summary>
    /// 获取最后一级的组织单元标识, 如果是外部用户则返回上一级WorkGroup的组织单元标识
    /// </summary>
    Guid LeafOrgUnitId { get; }

    /// <summary>
    /// 获取内部会话对应的员工标识，如果是外部用户则返回Guid.Empty
    /// </summary>
    Guid EmploeeId { get; }

    /// <summary>
    /// 获取外部会话对应的外部用户标识，如果是内部用户则返回Guid.Empty
    /// </summary>
    Guid ExternalId { get; }

    /// <summary>
    /// 获取层级信息
    /// 注意：0为最后一级
    /// </summary>
    TreePathNode this[int index] { get; }
}