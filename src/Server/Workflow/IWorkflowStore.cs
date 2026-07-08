namespace AppBox.Workflow;

public interface IWorkflowStore
{
    Task InsertWorkflowInstance(WorkflowInstance instance);

    Task UpdateWorkflowInstance(WorkflowInstance instance, Bookmark? bookmark);
    
    Task UpdateWorkflowInstance(WorkflowInstance instance, Guid bookmarkId, Guid actorId, ResumeResult resumeResult);
    
    // Task<bool> TryLockTask();
    // Task<bool> TryUnlockTask();
}