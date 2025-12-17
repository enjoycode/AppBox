using NanoLog;

namespace AppBoxServer.Design;

public static class DebugLogger
{
    public static readonly NanoLogger Logger = new(""
#if DEBUG
        , LogLevel.Trace
#endif
    );
}