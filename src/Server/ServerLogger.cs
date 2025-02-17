using NanoLog;

namespace AppBoxServer;

public static class ServerLogger
{
    public static readonly NanoLogger Logger = new(""
#if DEBUG
        , LogLevel.Trace
#endif
    );
}