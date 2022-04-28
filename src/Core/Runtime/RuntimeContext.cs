namespace AppBoxCore;

public static class RuntimeContext
{
    private static IRuntimeContext _instance = null!;

    public static void Init(IRuntimeContext instance) => _instance = instance;

    public static IUserSession? CurrentSession => _instance.CurrentSession;

    public static ValueTask<AnyValue> InvokeAsync(string service, InvokeArgs args)
        => _instance.InvokeAsync(service, args);
}