using AppBoxCore;

namespace AppBoxDesign;

public sealed class DesignTree : IBinSerializable
{
    private int _loadingFlag = 0;
    private readonly List<DesignNode> _rootNodes = new List<DesignNode>();
    private DataStoreRootNode _storeRootNode = null!;
    private ApplicationRootNode _appRootNode = null!;

    public readonly DesignHub DesignHub;

    public DesignTree(DesignHub hub)
    {
        DesignHub = hub;
    }

    public IList<DesignNode> RootNodes => _rootNodes;

    #region ====Load Methods====

    public Task LoadAsync()
    {
        if (Interlocked.CompareExchange(ref _loadingFlag, 1, 0) != 0)
            throw new Exception("DesignTree is loading.");

        //先判断是否已经加载过，是则清空准备重新加载
        if (_rootNodes.Count > 0)
            _rootNodes.Clear();

        //开始加载
        _storeRootNode = new DataStoreRootNode(this);
        _rootNodes.Add(_storeRootNode);
        _appRootNode = new ApplicationRootNode(this);
        _rootNodes.Add(_appRootNode);

        //先加载签出信息及StagedModels

        //1.加载Apps
        var appNode = new ApplicationNode(this, new ApplicationModel("sys", "sys"));
        _appRootNode.Children.Add(appNode);

        //添加默认存储节点
        var defaultDataStoreModel = new DataStoreModel(DataStoreKind.Sql, "Default", null);
        var defaultDataStoreNode = new DataStoreNode(defaultDataStoreModel);
        _storeRootNode.Children.Add(defaultDataStoreNode);

        //测试用节点
        var homePageModel = new ViewModel(ModelId.Make(12345, ModelType.View, 1, ModelLayer.SYS),
            "HomePage");
        var homePageNode = new ModelNode(homePageModel);
        appNode.FindModelRootNode(ModelType.View).Children.Add(homePageNode);

        //TODO:
        return Task.CompletedTask;
    }

    #endregion

    #region ====Find Methods====

    public ApplicationNode? FindApplicationNode(int appId)
        => _appRootNode.Children.Find(n => n.Model.Id == appId);

    #endregion

    #region ====Checkout Methods====

    /// <summary>
    /// 给设计节点添加签出信息，如果已签出的模型节点则用本地存储替换原模型
    /// </summary>
    internal void BindCheckoutInfo(DesignNode node, bool isNewNode)
    {
        //TODO:
    }

    #endregion

    #region ====IBinSerializable====

    public void WriteTo(IOutputStream ws)
    {
        ws.WriteVariant(_rootNodes.Count);
        foreach (var node in _rootNodes)
        {
            ws.WriteByte((byte)node.Type);
            node.WriteTo(ws);
        }
    }

    public void ReadFrom(IInputStream rs) => throw new NotSupportedException();

    #endregion
}