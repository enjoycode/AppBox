using AppBoxCore;

namespace AppBox.Workflow;

public sealed class WorkflowInstance
{
    public Dictionary<string, AnyValue> Parameters { get; } = [];
}