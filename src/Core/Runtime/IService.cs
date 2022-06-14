namespace AppBoxCore;

public interface IService
{
     ValueTask<AnyValue> InvokeAsync(ReadOnlyMemory<char> method, InvokeArgs args);
}