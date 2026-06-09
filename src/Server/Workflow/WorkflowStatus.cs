namespace AppBox.Workflow;

public enum WorkflowStatus : byte
{
    Running,
    Suspended,
    Finished,
    Failed,
}