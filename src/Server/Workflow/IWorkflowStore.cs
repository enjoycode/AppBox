namespace AppBox.Workflow;

public interface IWorkflowStore
{
    Task InsertWorkflowInstance(WorkflowInstance instance);

    Task<bool> TryLockTask();
    Task<bool> TryUnlockTask();
}