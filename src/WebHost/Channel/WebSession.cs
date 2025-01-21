using AppBoxCore;
using AppBoxDesign;
using AppBoxServer;

namespace AppBoxWebHost;

public sealed class WebSession : IDeveloperSession, IDisposable
{
    private readonly TreePath _treePath;
    // private DesignHub? _designHub;

    public WebSession(TreePath path, string sessionId)
    {
        _treePath = path;
        SessionId = sessionId;
    }

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

    #endregion

    #region ====IDeveloperSession====

    // private static readonly ModelId _developerPermissionId =
    //     ModelId.Make(Consts.SYS_APP_ID, ModelType.Permission, 2, ModelLayer.SYS);

    // public DesignHub GetDesignHub()
    // {
    //     if (_designHub == null)
    //     {
    //         lock (this)
    //         {
    //             if (_designHub == null)
    //             {
    //                 //验证Developer
    //                 if (!HostRuntimeContext.HasPermission(_developerPermissionId))
    //                     throw new Exception("Must login as a developer");
    //
    //                 _designHub = new DesignHub(this);
    //                 //_designHub.TypeSystem.Init();
    //             }
    //         }
    //     }
    //
    //     return _designHub;
    // }

    #endregion

    public void Dispose()
    {
        // _designHub?.Dispose();
    }
}