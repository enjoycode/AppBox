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
    
    public void InvalidModelsCache(string[]? services, ModelId[]? others, bool byPublish)
    {
        //先移除已加载的服务实例
        if (services != null)
        {
            foreach (var service in services)
            {
                AppServiceContainer.TryRemove(service);
            }
        }
        //再移除已加载的模型缓存
        if (others != null)
        {
            foreach (var t in others)
            {
                Models.Remove(t);
            }
        }
        //最后通知整个集群
        if (byPublish)
        {
            //TODO:*** 广播事件至集群
        }
    }

    public async ValueTask<AnyValue> InvokeAsync(string servicePath, InvokeArgs args)
    {
        var span = servicePath.AsMemory();
        var firstDot = span.Span.IndexOf('.');
        var lastDot = span.Span.LastIndexOf('.');
        if (firstDot == lastDot)
            throw new ServicePathException(nameof(servicePath));
        var app = span.Slice(0, firstDot);
        var service = servicePath.AsMemory(firstDot + 1, lastDot - firstDot - 1);
        var method = servicePath.AsMemory(lastDot + 1);

        IService? instance;
        try
        {
            //TODO:埋点监测性能指标
            //尝试系统内置服务调用
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
                Log.Warn(error);
                throw new Exception(error);
            }

            return await instance.InvokeAsync(method, args);
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