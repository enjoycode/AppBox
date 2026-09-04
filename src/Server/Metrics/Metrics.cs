using System.Diagnostics.Metrics;
using Microsoft.Extensions.Diagnostics.Metrics;

namespace AppBoxServer;

internal static partial class Metrics
{
    internal const string MeterName = "AppBox";
    private static readonly Meter Meter = new(MeterName, "1.0");

    internal readonly struct InvokeTags
    {
        /// <summary>
        /// 服务器标识
        /// </summary>
        public required string Server { get; init; }
        /// <summary>
        /// 调用方法名称 eg: sys.OrderService.Query
        /// </summary>
        public required string Method { get; init; }
    }

    [Histogram<float>(typeof(InvokeTags) /*, Unit = "ms"*/)]
    internal static partial InvokeDuration CreateInvokeDuration(Meter meter);

    /// <summary>
    /// 服务方法调用时间，单位ms
    /// </summary>
    internal static InvokeDuration InvokeDuration { get; } = CreateInvokeDuration(Meter);
}