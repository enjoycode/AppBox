using AppBoxCore;
using PixUI;

namespace AppBoxClient;

/// <summary>
/// 工作流表单接口
/// </summary>
public interface IWorkflowForm
{
    /// <summary>
    /// 工作流表单需要的尺寸
    /// </summary>
    Size ViewSize { get; }

    // /// <summary>
    // /// 工作流任务加载完成后的操作
    // /// </summary>
    // /// <remarks>
    // /// 可用于加载表单数据
    // /// </remarks>
    // ValueTask OnLoaded(WorkflowTaskInfo taskInfo);

    /// <summary>
    /// 开始递交人员处理结果前的操作
    /// </summary>
    /// <remarks>
    /// 可用于验证表单数据或保存表单数据
    /// </remarks>
    ValueTask BeforeSubmit(HumanAction action);
}