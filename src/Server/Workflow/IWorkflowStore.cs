namespace AppBox.Workflow;

public interface IWorkflowStore
{
    Task InsertInstance(WorkflowInstance instance);

    Task UpdateInstance(WorkflowInstance instance, Bookmark? bookmark);

    Task UpdateInstance(WorkflowInstance instance, Guid bookmarkId, Guid actorId, ResumeResult resumeResult);

    Task<WorkflowInstance> FetchInstance(Guid instanceId);
}