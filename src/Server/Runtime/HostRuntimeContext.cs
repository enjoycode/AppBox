using AppBoxCore;
using AppBoxStore;

namespace AppBoxServer;

/// <summary>
/// 服务端进程的运行时上下文
/// </summary>
public sealed class HostRuntimeContext : IHostRuntimeContext
{
    private static readonly AsyncLocal<IUserSession?> SessionStore = new();
    private readonly Dictionary<long, ModelBase> _models = new();
    private readonly Dictionary<int, ApplicationModel> _apps = new();

    public IUserSession? CurrentSession => SessionStore.Value;

    internal static void SetCurrentSession(IUserSession? session) => SessionStore.Value = session;

    public async ValueTask<ApplicationModel> GetApplicationAsync(int appId)
    {
        if (_apps.TryGetValue(appId, out var app))
            return app;

        //TODO: 暂简单实现加载全部
        var apps = await MetaStore.Provider.LoadAllApplicationAsync();
        foreach (var item in apps)
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

    public void InjectApplication(ApplicationModel appModel)
    {
        throw new NotImplementedException();
    }

    public void InjectModel(ModelBase model)
    {
        model.AcceptChanges();
        _models.Add(model.Id, model);
    }

    public ValueTask<AnyValue> InvokeAsync<T>(string service, T args) where T : struct, IInvokeArgs
    {
        return ServiceContainer.InvokeAsync(service, args);
    }

    #region ====供服务模型生成的代码使用的Invoke====

    /// <summary>
    /// 仅用于服务端服务调用服务(无返回)
    /// </summary>
    public static async ValueTask Invoke<T>(string service, T args) where T : struct, IInvokeArgs
    {
        await ServiceContainer.InvokeAsync(service, args);
    }

    /// <summary>
    /// 仅用于服务端服务调用服务(有返回)
    /// </summary>
    public static async ValueTask<TResult?> Invoke<TArgs, TResult>(string service, TArgs args)
        where TArgs : struct, IInvokeArgs
    {
        var res = await ServiceContainer.InvokeAsync(service, args);
        if (res.IsEmpty) return default;

        return (TResult)res.BoxedValue!; //TODO: avoid boxed
    }

    #endregion
}