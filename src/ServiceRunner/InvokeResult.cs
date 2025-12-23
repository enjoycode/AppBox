namespace ServiceDebugger;

internal readonly struct InvokeResult
{
    public string ErrorMessage { get; init; }

    public object? Result { get; init; }
}