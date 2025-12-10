using AppBoxCore;
using AppBoxDesign;
using AppBoxServer;

namespace AppBoxWebHost;

public sealed class WebSession : IDeveloperSession, IDisposable
{
    public WebSession(TreePath path, string sessionId, IRemoteChannel channel)
    {
        _treePath = path;
        SessionId = sessionId;
        Channel = channel;
    }

    private readonly TreePath _treePath;

    #region ====IUserSession====

    public string Name => _treePath[0].Text;

    public bool IsExternal => false;
    public string Tag => string.Empty;

    public string SessionId { get; }

    public int Levels => _treePath.Level;

    public Guid LeafOrgUnitId => (Guid)_treePath[0].Id;
    public Guid EmployeeId => LeafOrgUnitId;
    public Guid ExternalId => Guid.Empty;

    public TreePathNode this[int index] => _treePath[index];

    public IChannel Channel { get; }

    #endregion

    public void Dispose()
    {
        // _designHub?.Dispose();
    }
}