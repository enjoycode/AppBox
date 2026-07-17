namespace AppBoxCore;

/// <summary>
/// 仅用于运行时封装工作流任务
/// </summary>
public sealed class WorkflowTaskInfo
{
    public Guid InstanceId { get; set; }
    public Guid BookmarkId { get; set; }
    public int ModelVersion { get; set; }
    public string InstanceTitle { get; set; } = string.Empty;
    public string TaskTitle { get; set; } = string.Empty;
    public WorkflowParameters? Parameters { get; set; }
    public string CreatorName { get; set; } = string.Empty;

    public Task FetchParameters() => throw new NotImplementedException();
}