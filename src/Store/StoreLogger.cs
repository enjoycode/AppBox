using NanoLog;

namespace AppBoxStore;

public static class StoreLogger
{
    public static readonly NanoLogger Logger = new("Store"
#if DEBUG
        , LogLevel.Trace
#endif
    );
}