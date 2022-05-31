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