using AppBox.Workflow;
using AppBoxCore;

namespace Tests.Server.Workflow;

internal sealed class MockWorkflowStore : IWorkflowStore
{
    private readonly Dictionary<Guid, byte[]> _instances = new();

    public Task InsertWorkflowInstance(WorkflowInstance instance)
    {
        if (!_instances.TryAdd(instance.Id, SerializeInstance(instance)))
            throw new Exception($"Duplicate instance id: {instance.Id}");
        return Task.CompletedTask;
    }

    public Task UpdateWorkflowInstance(WorkflowInstance instance, Bookmark? bookmark)
    {
        _instances[instance.Id] = SerializeInstance(instance);
        return Task.CompletedTask;
    }

    public Task UpdateWorkflowInstance(WorkflowInstance instance, ResumeResult resumeResult)
    {
        _instances[instance.Id] = SerializeInstance(instance);
        return Task.CompletedTask;
    }

    public Task FinishWorkflowInstance(WorkflowInstance instance)
    {
        _instances.Remove(instance.Id);
        return Task.CompletedTask;
    }

    private static byte[] SerializeInstance(WorkflowInstance instance)
    {
        var ms = new MemoryStream();
        var ws = new SystemWriteStream(ms);

        ws.WriteGuid(instance.Id);
        ws.WriteString(instance.Title);
        ws.WriteGuid(instance.CreatorId);
        ws.WriteString(instance.CreatorName);
        ws.WriteDateTime(instance.CreateTime);
        ws.WriteByte((byte)instance.Status);

        instance.SerializeContext(ref ws);

        return ms.ToArray();
    }
}