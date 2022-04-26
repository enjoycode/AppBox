namespace AppBoxCore;

public interface IService
{
    public ValueTask<AnyValue> InvokeAsync(ReadOnlyMemory<char> method, InvokeArgs args);
}