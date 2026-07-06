namespace AppBox.Workflow;

/// <summary>
/// 人员操作结果
/// </summary>
public interface IHumanActionResult { }

public sealed class HumanActionResult : IHumanActionResult
{
    /// <summary>
    /// 操作结果，比如：同意 or 不同意
    /// </summary>
    public string Result { get; init; } = string.Empty;

    /// <summary>
    /// 操作备注
    /// </summary>
    public string Memo { get; init; } = string.Empty;
}

/// <summary>
/// 管理员重新指派人员
/// </summary>
public sealed class AssignmentResult : IHumanActionResult
{
    public Guid[] Assignments { get; init; } = [];
}