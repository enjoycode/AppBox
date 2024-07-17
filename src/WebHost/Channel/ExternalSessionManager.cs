using System.Diagnostics.CodeAnalysis;
using AppBoxCore;

namespace AppBoxWebHost;

internal static class ExternalSessionManager
{
    internal static readonly IExternalSessionManager Provider = new DefaultExternalSessionManager();
}

public interface IExternalSessionManager
{
    void Register(IUserSession session);

    bool TryGet(string sessionId, [MaybeNullWhen(false)] out IUserSession session);
}

internal sealed class DefaultExternalSessionManager : IExternalSessionManager
{
    private readonly Dictionary<string, IUserSession> _sessions = [];

    public void Register(IUserSession session)
    {
        if (!session.IsExternal)
            throw new NotSupportedException("Only for external session");
        if (string.IsNullOrEmpty(session.SessionId))
            throw new ArgumentNullException(nameof(session), "SessionId is empty");

        lock (_sessions)
        {
            _sessions[session.SessionId] = session;
        }
    }

    public bool TryGet(string sessionId, [MaybeNullWhen(false)] out IUserSession session)
    {
        lock (_sessions)
        {
            return _sessions.TryGetValue(sessionId, out session);
        }
    }
}

internal sealed class RestExternalSession(TreePath path) : IUserSession
{
    public string Name => path[0].Text;
    public bool IsExternal => true;

    public string Tag { get; } = string.Empty;

    public string SessionId => (string)path[0].Id;
    public int Levels => path.Level;
    public Guid LeafOrgUnitId => (Guid)path[1].Id;
    public Guid EmployeeId => Guid.Empty;
    public Guid ExternalId => Guid.Empty;

    public TreePathNode this[int index] => path[index];
}