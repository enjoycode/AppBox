using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxStore;

namespace AppBoxServer;

/// <summary>
/// 服务端进程的运行时上下文
/// </summary>
public sealed class HostRuntimeContext : IHostRuntimeContext
{
    private static readonly AsyncLocal<IUserSession?> _sessionStore = new();
    private readonly Dictionary<long, ModelBase> _models = new();
    private readonly Dictionary<int, ApplicationModel> _apps = new();

    public IUserSession? CurrentSession => _sessionStore.Value;

    internal static void SetCurrentSession(IUserSession? session) => _sessionStore.Value = session;

    public async ValueTask<ApplicationModel> GetApplicationAsync(int appId)
    {
        if (_apps.TryGetValue(appId, out var app))
            return app;

        //TODO: 暂简单实现加载全部
        var apps = await MetaStore.Provider.LoadAllApplicationAsync();
        foreach(var item in apps)
        {
            _apps[item.Id] = item;
        }
        if (!_apps.TryGetValue(appId, out var app2))
            throw new Exception("Can't load Application from MetaStore");
        return app2;
    }

    public async ValueTask<T> GetModelAsync<T>(ModelId modelId) where T : ModelBase
    {
        if (_models.TryGetValue(modelId, out var model))
            return (T)model;

        model = await MetaStore.Provider.LoadModelAsync(modelId);
        if (model == null)
            throw new Exception("Can't load model from MetaStore");

        _models.TryAdd(modelId, model);
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
                _models.Remove(t);
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

    /// <summary>
    /// 仅用于服务端服务调用服务(无返回)
    /// </summary>
    public static async ValueTask Invoke(string service, InvokeArgs args)
    {
        await RuntimeContext.InvokeAsync(service, args);
    }

    /// <summary>
    /// 仅用于服务端服务调用服务(有返回)
    /// </summary>
    public static async ValueTask<T?> Invoke<T>(string service, InvokeArgs args)
    {
        var res = await RuntimeContext.InvokeAsync(service, args);
        if (res.IsEmpty) return default;

        return (T)res.BoxedValue!;
    }

    public void InjectApplication(ApplicationModel appModel)
    {
        throw new NotImplementedException();
    }

    public void InjectModel(ModelBase model)
    {
        model.AcceptChanges();
        _models.Add(model.Id, model);
    }
}