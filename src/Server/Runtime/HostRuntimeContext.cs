using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxStore;

namespace AppBoxServer;

internal sealed class HostRuntimeContext : IHostRuntimeContext
{
    private static readonly AsyncLocal<IUserSession?> SessionStore = new();
    private readonly Dictionary<long, ModelBase> Models = new();

    public IUserSession? CurrentSession => SessionStore.Value;

    internal static void SetCurrentSession(IUserSession? session)
    {
        SessionStore.Value = session;
    }

    public async ValueTask<T> GetModelAsync<T>(ModelId modelId) where T : ModelBase
    {
        if (Models.TryGetValue(modelId, out var model))
            return (T)model;

        model = await MetaStore.Provider.LoadModelAsync(modelId);
        if (model == null)
            throw new Exception("Can't load model from ModelStore");

        Models.TryAdd(modelId, model);
        return (T)model;
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

    public void InjectApplication(ApplicationModel appModel)
    {
        throw new NotImplementedException();
    }

    public void InjectModel(ModelBase model)
    {
        model.AcceptChanges();
        Models.Add(model.Id, model);
    }
}