using AppBoxCore;

namespace AppBoxServer.Design;

internal sealed class DebugService : IService
{
    
    
    public ValueTask<AnyValue> InvokeAsync<T>(ReadOnlyMemory<char> method, T args) where T : struct, IInvokeArgs
    {
        throw new NotImplementedException();
    }
}