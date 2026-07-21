namespace AppBoxCore;

/// <summary>
/// 运行时上下文
/// </summary>
public static class RuntimeContext
{
    public static void Init(IRuntimeContext instance, IPasswordHasher? passwordHasher)
    {
        Current = instance;
        PasswordHasher = passwordHasher;
    }

    public static IRuntimeContext Current { get; private set; } = null!;

    public static IPasswordHasher? PasswordHasher { get; private set; }

    public static IUserSession? CurrentSession => Current.CurrentSession;

    public static ApplicationModel GetApplication(int appId) => Current.GetApplication(appId);

    public static T GetModel<T>(ModelId modelId) where T : ModelBase => Current.GetModel<T>(modelId);

    public static ValueTask<T> GetModelAsync<T>(ModelId modelId) where T : ModelBase
        => Current.GetModelAsync<T>(modelId);

    /// <summary>
    /// 判断当前运行时内的当前用户是否具备指定权限模型的授权
    /// </summary>
    public static bool HasPermission(ModelId permissionModelId)
    {
        if (CurrentSession == null) return false;

        var model = GetModel<PermissionModel>(permissionModelId);
        return model.Owns(CurrentSession);
    }

    #region ====Invoke包装====

    //TODO:*****服务调用服务的参数及返回值，因每个服务的独立性，需要实体类的相关转换

    public static async ValueTask Invoke(string service) => await Current.InvokeAsync(service, AnyArgs.Empty);

    public static async ValueTask Invoke(string service, AnyValue arg) =>
        await Current.InvokeAsync(service, AnyArgs.Make(arg));

    public static async ValueTask Invoke(string service, AnyValue arg1, AnyValue arg2) =>
        await Current.InvokeAsync(service, AnyArgs.Make(arg1, arg2));

    public static async ValueTask Invoke(string service, AnyValue arg1, AnyValue arg2, AnyValue arg3) =>
        await Current.InvokeAsync(service, AnyArgs.Make(arg1, arg2, arg3));

    public static async ValueTask Invoke(string service, AnyValue arg1, AnyValue arg2, AnyValue arg3, AnyValue arg4) =>
        await Current.InvokeAsync(service, AnyArgs.Make(arg1, arg2, arg3, arg4));

    public static async ValueTask Invoke(string service, AnyValue arg1, AnyValue arg2, AnyValue arg3, AnyValue arg4,
        AnyValue arg5)
        => await Current.InvokeAsync(service, AnyArgs.Make(arg1, arg2, arg3, arg4, arg5));

    public static async ValueTask<T> Invoke<T>(string service, EntityFactory[]? entityFactories = null) =>
        (await Current.InvokeAsync(service, AnyArgs.Empty)).CastTo<T>();

    public static async ValueTask<T> Invoke<T>(string service, AnyValue arg, EntityFactory[]? entityFactories = null) =>
        (await Current.InvokeAsync(service, AnyArgs.Make(arg))).CastTo<T>();

    public static async ValueTask<T> Invoke<T>(string service, AnyValue arg1, AnyValue arg2,
        EntityFactory[]? entityFactories = null) =>
        (await Current.InvokeAsync(service, AnyArgs.Make(arg1, arg2))).CastTo<T>();

    public static async ValueTask<T> Invoke<T>(string service, AnyValue arg1, AnyValue arg2, AnyValue arg3,
        EntityFactory[]? entityFactories = null) =>
        (await Current.InvokeAsync(service, AnyArgs.Make(arg1, arg2, arg3))).CastTo<T>();

    public static async ValueTask<T> Invoke<T>(string service, AnyValue arg1, AnyValue arg2, AnyValue arg3,
        AnyValue arg4, EntityFactory[]? entityFactories = null) =>
        (await Current.InvokeAsync(service, AnyArgs.Make(arg1, arg2, arg3, arg4))).CastTo<T>();

    public static async ValueTask<T> Invoke<T>(string service, AnyValue arg1, AnyValue arg2, AnyValue arg3,
        AnyValue arg4, AnyValue arg5, EntityFactory[]? entityFactories = null) =>
        (await Current.InvokeAsync(service, AnyArgs.Make(arg1, arg2, arg3, arg4, arg5))).CastTo<T>();

    #endregion
}