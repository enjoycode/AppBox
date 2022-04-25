namespace AppBoxWebHost;

public sealed class WebSession : IDisposable
{

    public ulong SessionId { get; } = 0;

    public void Dispose() {}
}