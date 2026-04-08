namespace AppBoxDesign;

/// <summary>
/// 发布时变更的模型信息，仅用于前端显示变更项
/// </summary>
internal sealed class PendingChange
{
    public PendingChangeType ChangeType { get; set; }

    /// <summary>
    /// ModelBase or ModelFolder now.
    /// </summary>
    public object? Target { get; set; }

    /// <summary>
    /// eg: Entity or Folder
    /// </summary>
    public string DisplayType { get; set; } = null!;

    /// <summary>
    /// eg: sys.OrderService
    /// </summary>
    public string DisplayName { get; set; } = null!;
}

internal enum PendingChangeType : byte
{
    Added = 0,
    Modified = 1,
    Deleted = 2,
}