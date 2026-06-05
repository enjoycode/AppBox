using NanoLog;

namespace AppBox.Workflow;

public static class WorkflowLogger
{
    public static readonly NanoLogger Logger = new(""
#if DEBUG
        , LogLevel.Trace
#endif
    );
}