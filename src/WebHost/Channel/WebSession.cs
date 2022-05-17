using AppBoxCore;
using AppBoxDesign;

namespace AppBoxWebHost;

public sealed class WebSession : IDeveloperSession, IDisposable
{
    private readonly TreePath _treePath;
    private DesignHub? _designHub;

    public WebSession(TreePath path, int sessionId)
    {
        _treePath = path;
        SessionId = sessionId;
    }

    #region ====IUserSession====

    public string Name => _treePath[0].Text;

    public bool IsExternal => false;
    public string Tag => string.Empty;

    public int SessionId { get; } = 0;

    public int Levels => _treePath.Level;

    public Guid LeafOrgUnitId => Guid.Empty;
    public Guid EmploeeId => Guid.Empty;
    public Guid ExternalId => Guid.Empty;

    public TreePathNode this[int index] => _treePath[index];

    #endregion

    #region ====IDeveloperSession====

    public DesignHub GetDesignHub()
    {
        //TODO:验证Developer
        if (_designHub == null)
        {
            _designHub = new DesignHub(this);
            //_designHub.TypeSystem.Init();
        }

        return _designHub;
    }

    #endregion

    public void Dispose()
    {
        _designHub?.Dispose();
    }
}