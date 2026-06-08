using AppBox.Workflow;

namespace Tests.Server.Workflow;

internal sealed class MockWorkflowStore : IWorkflowStore
{
    private readonly Dictionary<Guid, WorkflowInstance> _instances = new();

    public Task InsertWorkflowInstance(WorkflowInstance instance)
    {
        throw new NotImplementedException();
    }

    public Task UpdateWorkflowInstance(WorkflowInstance instance, Bookmark? bookmark)
    {
        throw new NotImplementedException();
    }
}