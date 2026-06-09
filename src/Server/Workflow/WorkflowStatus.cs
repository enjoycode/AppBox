namespace AppBox.Workflow;

public enum WorkflowStatus : byte
{
    Running,
    Suspended,
    Finished,

    /// <summary>
    /// 需要工作流管理员介入
    /// </summary>
    WaitAdminResume,

    /// <summary>
    /// 发生异常中止
    /// </summary>
    Failed,
}