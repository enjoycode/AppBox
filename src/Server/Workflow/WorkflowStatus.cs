namespace AppBox.Workflow;

public enum WorkflowStatus : byte
{
    Running,
    Suspended,
    Finished,
    /// <summary>
    /// 异常或其他需要工作流管理员介入
    /// </summary>
    WaitAdminResume
}