namespace AppBoxCore;

public static class RuntimeContext
{
    public static void Init(IRuntimeContext instance, IPasswordHasher? passwordHasher)
    {
        _instance = instance;
        _passwordHasher = passwordHasher;
    }

    private static IRuntimeContext _instance = null!;
    private static IPasswordHasher? _passwordHasher;

    public static IRuntimeContext Current => _instance;

    public static IPasswordHasher PasswordHasher => _passwordHasher!;

    public static IUserSession? CurrentSession => _instance.CurrentSession;

    public static ValueTask<T> GetModelAsync<T>(ModelId modelId) where T : ModelBase
        => _instance.GetModelAsync<T>(modelId);

    public static ValueTask<AnyValue> InvokeAsync(string service, InvokeArgs args)
        => _instance.InvokeAsync(service, args);
}