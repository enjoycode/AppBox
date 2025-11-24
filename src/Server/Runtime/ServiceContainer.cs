using AppBoxCore;
using static AppBoxServer.ServerLogger;

namespace AppBoxServer;

internal static class ServiceContainer
{
    public static async ValueTask<AnyValue> InvokeAsync<T>(string servicePath, T args) where T : struct, IInvokeArgs
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
            //TODO:埋点监测性能指标
            //尝试系统内置服务调用
            IService? instance;
            if (app.Span.SequenceEqual(Consts.SYS))
            {
                instance = SysServiceContainer.TryGet(service);
                if (instance != null)
                    return await instance.InvokeAsync(method, args);
            }

            //应用服务调用
            instance = await AppServiceContainer.TryGetAsync($"{app}.{service}"); //TODO:优化
            if (instance == null)
            {
                var error = $"Can't find service: {servicePath}";
                Logger.Warn(error);
                throw new Exception(error);
            }

            return await instance.InvokeAsync(method, args);
        }
        finally
        {
            args.Free();
        }
    }
}