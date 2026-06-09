namespace AppBox.Workflow;

public readonly struct ResumeResult
{
    /// <summary>
    /// 是否继续挂起，比如多人活动提交一个结果后，尚未达到继续执行的条件
    /// </summary>
    public bool Suspended { get; init; }

    /// <summary>
    /// 是否需要取消相同Bookmark的所有其他任务
    /// </summary>
    public bool CancelOthers { get; init; }

    // public bool HasError { get; init; } = false;
    //
    // public string ErrorMessage { get; init; } = string.Empty;

    /// <summary>
    /// 继续执行的Activity，注意：可能为null
    /// </summary>
    public Activity? Next { get; init; }
}