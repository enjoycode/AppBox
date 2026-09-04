using System.Diagnostics;
using AppBoxCore;
using static AppBoxServer.ServerLogger;

namespace AppBoxServer;

internal static class ServiceContainer
{
    /// <summary>
    /// 调用服务，完成后释放AnyArgs使用的缓存
    /// </summary>
    public static async ValueTask<AnyValue> InvokeAsync<T>(string servicePath, T args) where T : struct, IAnyArgs
    {
        var span = servicePath.AsMemory();
        var firstDot = span.Span.IndexOf('.');
        var lastDot = span.Span.LastIndexOf('.');
        if (firstDot == lastDot)
            throw new ServicePathException(nameof(servicePath));
        var app = span.Slice(0, firstDot);
        var service = servicePath.AsMemory(firstDot + 1, lastDot - firstDot - 1);
        var method = servicePath.AsMemory(lastDot + 1);

        try
        {
            var ts = Stopwatch.GetTimestamp();
            //尝试系统内置服务调用
            IService? instance = null;
            if (app.Span.SequenceEqual(Consts.SYS))
                instance = SysServiceContainer.TryGet(service);

            //应用服务调用
            instance ??= await AppServiceContainer.TryGetAsync($"{app}.{service}");
            if (instance == null)
            {
                var error = $"Can't find service: {servicePath}";
                Logger.Warn(error);
                throw new Exception(error);
            }

            var result = await instance.InvokeAsync(method, args);
            //埋点监测性能指标
            Metrics.InvokeDuration.Record((float)Stopwatch.GetElapsedTime(ts).TotalMilliseconds, new()
            {
                Server = HostRuntimeContext.ServerIdTag,
                Method = servicePath
            });
            return result;
        }
        finally
        {
            args.Free();
        }
    }
}