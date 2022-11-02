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

    public static ApplicationModel GetApplication(int appId)
    {
        var task = Current.GetApplicationAsync(appId);
        return task.IsCompleted ? task.Result : task.AsTask().Result;
    }

    public static T GetModel<T>(ModelId modelId) where T: ModelBase
    {
        var task = Current.GetModelAsync<T>(modelId);
        return task.IsCompleted ? task.Result : task.AsTask().Result;
    }

    public static ValueTask<T> GetModelAsync<T>(ModelId modelId) where T : ModelBase
        => Current.GetModelAsync<T>(modelId);

    public static ValueTask<AnyValue> InvokeAsync(string service, InvokeArgs args)
        => Current.InvokeAsync(service, args);
}