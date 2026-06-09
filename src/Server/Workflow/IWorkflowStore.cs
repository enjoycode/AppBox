namespace AppBox.Workflow;

public interface IWorkflowStore
{
    Task InsertWorkflowInstance(WorkflowInstance instance);

    Task UpdateWorkflowInstance(WorkflowInstance instance, Bookmark? bookmark);
    
    Task FinishWorkflowInstance(WorkflowInstance instance);

    // Task<bool> TryLockTask();
    // Task<bool> TryUnlockTask();
}