namespace AppBoxDesign;

public sealed class DesignTree
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

        //TODO:
        return Task.CompletedTask;
    }

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
}