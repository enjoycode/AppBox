using AppBoxCore;

namespace AppBoxClient;

/// <summary>
/// 工作流表单接口
/// </summary>
public interface IWorkflowForm
{
    public WorkflowTaskInfo TaskInfo { get; set; }
}