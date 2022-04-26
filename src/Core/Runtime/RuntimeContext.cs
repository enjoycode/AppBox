namespace AppBoxCore;

public static class RuntimeContext
{
    private static IRuntimeContext Instance = null!;

    public static void Init(IRuntimeContext instance) => Instance = instance;

    public static ValueTask<AnyValue> InvokeAsync(string service, InvokeArgs args)
        => Instance.InvokeAsync(service, args);
}