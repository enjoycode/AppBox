using AppBoxCore;

namespace AppBoxDesign;

public sealed class DesignTree : IBinSerializable
{
    public DesignTree(DesignHub hub)
    {
        DesignHub = hub;
    }

    private int _loadingFlag = 0;
    private readonly List<DesignNode> _rootNodes = new List<DesignNode>();
    private DataStoreRootNode _storeRootNode = null!;
    private ApplicationRootNode _appRootNode = null!;

    private Dictionary<string, CheckoutInfo> _checkouts = null!;

    /// <summary>
    /// 仅用于加载树时临时放入挂起的模型
    /// </summary>
    internal StagedItems Staged { get; private set; }

    public readonly DesignHub DesignHub;

    public IList<DesignNode> RootNodes => _rootNodes;

    #region ====Load Methods====

    public async Task LoadAsync()
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
        _checkouts = await CheckoutService.LoadAllAsync();
        Staged = await StagedService.LoadStagedAsync(onlyModelsAndFolders: true);

        //1.加载Apps
        var appNode = new ApplicationNode(this, new ApplicationModel("sys", "sys"));
        _appRootNode.Children.Add(appNode);

        //添加默认存储节点
        var defaultDataStoreModel = new DataStoreModel(DataStoreKind.Sql, "Default", null);
        var defaultDataStoreNode = new DataStoreNode(defaultDataStoreModel);
        _storeRootNode.Children.Add(defaultDataStoreNode);

        //测试用节点
        var empModel = new EntityModel(
            ModelId.Make(appNode.Model.Id, ModelType.Entity, 1, ModelLayer.SYS), "Employee");
        var nameField = new DataFieldModel(empModel, "Name", DataFieldType.String, false);
        empModel.AddMember(nameField);
        var empNode = appNode.FindModelRootNode(ModelType.Entity).AddModelForLoad(empModel);

        var homePageModel = new ViewModel(
            ModelId.Make(appNode.Model.Id, ModelType.View, 1, ModelLayer.SYS),
            "HomePage");
        var homePageNode = appNode.FindModelRootNode(ModelType.View).AddModelForLoad(homePageModel);
        var demoPageModel = new ViewModel(
            ModelId.Make(appNode.Model.Id, ModelType.View, 2, ModelLayer.DEV),
            "DemoPage");
        var demoPageNode = appNode.FindModelRootNode(ModelType.View).AddModelForLoad(demoPageModel);

        //在所有节点加载完成后创建模型对应的RoslynDocument
        await DesignHub.TypeSystem.CreateModelDocumentAsync(empNode);
        await DesignHub.TypeSystem.CreateModelDocumentAsync(homePageNode);
        await DesignHub.TypeSystem.CreateModelDocumentAsync(demoPageNode);

        Interlocked.Exchange(ref _loadingFlag, 0);
    }

    #endregion

    #region ====Find Methods====

    public ApplicationNode? FindApplicationNode(int appId)
        => _appRootNode.Children.Find(n => n.Model.Id == appId);

    public ApplicationNode? FindApplicationNodeByName(ReadOnlyMemory<char> name)
        => _appRootNode.Children.Find(n => n.Model.Name.AsSpan().SequenceEqual(name.Span));

    public ModelRootNode? FindModelRootNode(int appId, ModelType modelType)
        => FindApplicationNode(appId)?.FindModelRootNode(modelType);

    public ModelNode? FindModelNode(ModelType modelType, ModelId modelId)
        => FindModelRootNode(modelId.AppId, modelType)?.FindModelNode(modelId);

    public ModelNode? FindModelNodeByName(int appId, ModelType modelType, ReadOnlyMemory<char> name)
        => FindModelRootNode(appId, modelType)?.FindModelNodeByName(name);

    // /// <summary>
    // /// 设计时新建模型时检查名称是否已存在
    // /// </summary>
    // public bool IsModelNameExists(int appId, ModelType modelType, ReadOnlyMemory<char> name)
    // {
    //     //TODO:***** 如果forNew = true,考虑在这里加载存储有没有相同名称的存在,或发布时检测，如改为全局Workspace没有此问题
    //     // dev1 -> load tree -> checkout -> add model -> publish
    //     // dev2 -> load tree                                 -> checkout -> add model with same name will pass
    // }

    /// <summary>
    /// 根据全名称找到模型节点
    /// </summary>
    /// <param name="fullName">eg: sys.Entities.Employee</param>
    public ModelNode? FindModelNodeByFullName(string fullName)
    {
        var firstDot = fullName.IndexOf('.');
        var lastDot = fullName.LastIndexOf('.');
        var appName = fullName.AsMemory(0, firstDot);
        var typeName = fullName.AsSpan(firstDot + 1, lastDot - firstDot - 1);
        var modelName = fullName.AsMemory(lastDot + 1);

        var appNode = FindApplicationNodeByName(appName);
        if (appNode == null) return null;
        var modelType = CodeUtil.GetModelTypeFromPluralString(typeName);
        return FindModelNodeByName(appNode.Model.Id, modelType, modelName);
    }

    #endregion

    #region ====Checkout Methods====

    /// <summary>
    /// 用于签出节点成功后添加签出信息列表
    /// </summary>
    internal void AddCheckoutInfos(IList<CheckoutInfo> infos)
    {
        foreach (var item in infos)
        {
            var key = CheckoutInfo.MakeKey(item.NodeType, item.TargetID);
            _checkouts.TryAdd(key, item);
        }
    }

    /// <summary>
    /// 给设计节点添加签出信息，如果已签出的模型节点则用Staged替换原模型
    /// </summary>
    internal void BindCheckoutInfo(DesignNode node, bool isNewNode)
    {
        //if (node.NodeType == DesignNodeType.FolderNode || !node.AllowCheckout)
        //    throw new ArgumentException("不允许绑定签出信息: " + node.NodeType.ToString());

        //先判断是否新增的
        if (isNewNode)
        {
            node.CheckoutInfo = new CheckoutInfo(node.Type, node.CheckoutTargetId, node.Version,
                DesignHub.Session.Name, DesignHub.Session.LeafOrgUnitId);
            return;
        }

        //非新增的比对服务端的签出列表
        var key = CheckoutInfo.MakeKey(node.Type, node.CheckoutTargetId);
        if (_checkouts.TryGetValue(key, out var checkout))
        {
            node.CheckoutInfo = checkout;
            if (node.IsCheckoutByMe && node is ModelNode modelNode) //如果是被当前用户签出的模型
            {
                //从Staged加载
                var stagedModel = Staged.FindModel(modelNode.Model.Id);
                if (stagedModel != null)
                    modelNode.Model = stagedModel;
            }
        }
    }

    /// <summary>
    /// 部署完后更新所有模型节点的状态，并移除待删除的节点
    /// </summary>
    public void CheckinAllNodes()
    {
        //循环更新模型节点
        for (var i = 0; i < _appRootNode.Children.Count; i++)
        {
            _appRootNode.Children[i].CheckinAllNodes();
        }

        //刷新签出信息表，移除被自己签出的信息
        var list = _checkouts.Keys
            .Where(key =>
                _checkouts[key].DeveloperOuid == RuntimeContext.CurrentSession!.LeafOrgUnitId)
            .ToList();
        foreach (var key in list)
        {
            _checkouts.Remove(key);
        }
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