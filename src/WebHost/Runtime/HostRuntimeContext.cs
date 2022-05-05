using AppBoxCore;

namespace AppBoxWebHost;

internal sealed class HostRuntimeContext : IRuntimeContext
{
    private static readonly AsyncLocal<IUserSession?> SessionStore = new();

    public IUserSession? CurrentSession => SessionStore.Value;

    internal static void SetCurrentSession(IUserSession? session)
    {
        SessionStore.Value = session;
    }

    public ValueTask<AnyValue> InvokeAsync(string servicePath, InvokeArgs args)
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
            //尝试系统服务调用
            if (app.Span.SequenceEqual("sys"))
            {
                var instance = SysServiceContainer.TryGet(service);
                if (instance == null)
                    throw new ServiceNotExistsException($"Can't find system service: {service}");
                return instance.InvokeAsync(method, args);
            }

            //应用服务调用
            throw new NotImplementedException();
        }
        finally
        {
            args.Free();
        }
    }
}