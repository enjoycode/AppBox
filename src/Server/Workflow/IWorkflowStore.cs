namespace AppBox.Workflow;

public interface IWorkflowStore
{
    Task InsertWorkflowInstance(WorkflowInstance instance);

    Task UpdateWorkflowInstance(WorkflowInstance instance, Bookmark? bookmark);
    
    Task UpdateWorkflowInstance(WorkflowInstance instance, ResumeResult resumeResult);
    
    Task FinishWorkflowInstance(WorkflowInstance instance);

    // Task<bool> TryLockTask();
    // Task<bool> TryUnlockTask();
}