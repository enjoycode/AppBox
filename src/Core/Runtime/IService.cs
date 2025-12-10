namespace AppBoxCore;

public interface IService
{
    ValueTask<AnyValue> InvokeAsync<T>(ReadOnlyMemory<char> method, T args) where T : struct, IAnyArgs;
}