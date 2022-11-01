namespace AppBoxCore;

/// <summary>
/// 运行时上下文，用于提供模型容器及服务调用
/// </summary>
public interface IRuntimeContext
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

    /// <summary>
    /// 调用服务
    /// </summary>
    /// <param name="service">eg: sys.HelloService.SayHello</param>
    /// <param name="args">注意: 使用完后必须调用args.Free()释放缓存</param>
    ValueTask<AnyValue> InvokeAsync(string service, InvokeArgs args);

    /// <summary>
    /// 用于发布时更新模型缓存
    /// </summary>
    void InvalidModelsCache(string[]? services, ModelId[]? others, bool byPublish);
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