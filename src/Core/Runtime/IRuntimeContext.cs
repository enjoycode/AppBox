namespace AppBoxCore;

/// <summary>
/// 运行时上下文，用于提供模型容器及服务调用
/// </summary>
public interface IRuntimeContext : IModelContainer
{
    /// <summary>
    /// 当前用户的会话信息
    /// </summary>
    IUserSession? CurrentSession { get; }

    /// <summary>
    /// 获取应用模型,找不到抛异常
    /// </summary>
    ValueTask<ApplicationModel> GetApplicationAsync(int appId);

    /// <summary>
    /// 获取运行时模型,找不到抛异常
    /// </summary>
    ValueTask<T> GetModelAsync<T>(ModelId modelId) where T : ModelBase;

    ValueTask<AnyValue> InvokeAsync<T>(string service, T args) where T : struct, IAnyArgs;

    /// <summary>
    /// 用于发布时更新模型缓存
    /// </summary>
    void InvalidModelsCache(string[]? services, ModelId[]? others, bool byPublish);

    public ApplicationModel GetApplication(int appId)
    {
        var task = GetApplicationAsync(appId);
        return task.IsCompleted ? task.Result : task.AsTask().Result;
    }

    public T GetModel<T>(ModelId modelId) where T : ModelBase
    {
        var task = GetModelAsync<T>(modelId);
        return task.IsCompleted ? task.Result : task.AsTask().Result;
    }

    ApplicationModel IModelContainer.GetApplicationModel(int appId) => GetApplication(appId);

    EntityModel IModelContainer.GetEntityModel(ModelId modelId) => GetEntityModel(modelId);
}

public interface IHostRuntimeContext : IRuntimeContext
{
    /// <summary>
    /// 仅用于StoreInitiator
    /// </summary>
    void InjectApplication(ApplicationModel appModel);

    /// <summary>
    /// 仅用于StoreInitiator
    /// </summary>
    void InjectModel(ModelBase model);
}