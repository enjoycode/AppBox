using AppBoxCore;

namespace AppBoxWebHost;

internal static class ExternalSessionManager
{
    internal static readonly IExternalSessionManager Provider = new DefaultExternalSessionManager();
}

public interface IExternalSessionManager
{
    void Register(IUserSession session);
}

internal sealed class DefaultExternalSessionManager : IExternalSessionManager
{
    private readonly Dictionary<int, IUserSession> _sessions = [];

    public void Register(IUserSession session)
    {
        if (!session.IsExternal)
            throw new NotSupportedException("Only for external session");
        
        throw new NotImplementedException();
    }
}