namespace AppBox.Workflow;

public interface IHumanActionResult
{
    /// <summary>
    /// 操作结果，比如：同意 or 不同意
    /// </summary>
    string Result { get; }

    /// <summary>
    /// 操作备注
    /// </summary>
    string Memo { get; }
}

public sealed class HumanActionResult : IHumanActionResult
{
    public string Result { get; init; } = string.Empty;
    public string Memo { get; init; } = string.Empty;
}

/// <summary>
/// 管理员重新指派人员
/// </summary>
public sealed class AssignmentResult : IHumanActionResult
{
    public string Result { get; } = string.Empty;
    public string Memo { get; } = string.Empty;
}