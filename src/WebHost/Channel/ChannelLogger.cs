using NanoLog;

namespace AppBoxWebHost;

public static class ChannelLogger
{
    public static readonly NanoLogger Logger = new("Channel"
#if DEBUG
        , NanoLog.LogLevel.Trace
#endif
    );
}