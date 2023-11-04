using AppBoxCore;
using AppBoxStore;

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
    internal StagedItems? Staged { get; private set; }

    public readonly DesignHub DesignHub;

    public IList<DesignNode> RootNodes => _rootNodes;

    internal ApplicationRootNode AppRootNode => _appRootNode;

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

        //1.先加载签出信息及StagedModels
        _checkouts = await CheckoutService.LoadAllAsync();
        Staged = await StagedService.LoadStagedAsync(onlyModelsAndFolders: true);

        //2.开始加载设计时元数据
        //加载Apps
        var mapps = await MetaStore.Provider.LoadAllApplicationAsync();
        var apps = new List<ApplicationModel>(mapps);
        apps.Sort((a, b) => string.Compare(a.Name, b.Name, StringComparison.Ordinal));

        //加载Folders
        var mfolders = await MetaStore.Provider.LoadAllFolderAsync();
        var folders = new List<ModelFolder>(mfolders);
        //从staged中添加新建的并更新修改的文件夹
        Staged.UpdateFolders(folders);

        //加载Models
        var mmodels = await MetaStore.Provider.LoadAllModelAsync();
        var models = new List<ModelBase>(mmodels);

        //添加默认存储节点
#if !FUTURE
        var defaultDataStoreModel = new DataStoreModel(DataStoreKind.Sql, "Default", null);
        //defaultDataStoreModel.AcceptChanges();
        var defaultDataStoreNode = new DataStoreNode(defaultDataStoreModel);
        _storeRootNode.Children.Add(defaultDataStoreNode);
#endif

        //3.加载staged中新建的模型，可能包含DataStoreModel
        models.AddRange(Staged.FindNewModels());

        //4.开始添加树节点
        //加入AppModels节点
        foreach (var app in apps)
        {
            _appRootNode.Children.Add(new ApplicationNode(this, app));
        }

        //加入Folders
        foreach (var folder in folders)
        {
            FindModelRootNode(folder.AppId, folder.TargetModelType)!.LoadFolder(folder);
        }

        //加入Models
        Staged.RemoveDeletedModels(models); //先移除已删除的
        var allModelNodes = new List<ModelNode>(models.Count);
        foreach (var model in models)
        {
            allModelNodes.Add(FindModelRootNode(model.Id.AppId, model.ModelType)!.LoadModel(model));
        }

        //5.在所有节点加载完后创建模型对应的RoslynDocument
        foreach (var modelNode in allModelNodes)
        {
            await DesignHub.TypeSystem.CreateModelDocumentAsync(modelNode);
        }

        Staged = null;
        Interlocked.Exchange(ref _loadingFlag, 0);

#if DEBUG
        DesignHub.TypeSystem.DumpAllProjectErrors();
#endif
    }

    #endregion

    #region ====Find Methods====

    /// <summary>
    /// 用于前端传回的参数查找对应的设计节点
    /// </summary>
    public DesignNode? FindNode(DesignNodeType type, string id)
    {
        switch (type)
        {
            case DesignNodeType.ModelNode:
                ModelId modelId = id;
                return FindModelNode(modelId);
            case DesignNodeType.FolderNode:
                return FindFolderNode(id);
            case DesignNodeType.DataStoreNode:
                return _storeRootNode.Children.Find(n => n.Id == id);
            case DesignNodeType.ModelRootNode:
                var sepIndex = id.IndexOf('-');
                var appId = (int)uint.Parse(id.AsSpan(0, sepIndex));
                var modelType = (ModelType)byte.Parse(id.AsSpan(sepIndex + 1));
                return FindModelRootNode(appId, modelType);
            default:
                Log.Warn($"FindNode: {type} 未实现");
                throw new NotImplementedException();
        }
    }

    public ApplicationNode? FindApplicationNode(int appId)
        => _appRootNode.Children.Find(n => n.Model.Id == appId);

    public ApplicationNode? FindApplicationNodeByName(ReadOnlyMemory<char> name)
        => _appRootNode.Children.Find(n => n.Model.Name.AsSpan().SequenceEqual(name.Span));

    public ModelRootNode? FindModelRootNode(int appId, ModelType modelType)
        => FindApplicationNode(appId)?.FindModelRootNode(modelType);

    public FolderNode? FindFolderNode(string id)
    {
        var folderId = new Guid(id); //注意：id为Guid形式
        for (var i = 0; i < _appRootNode.Children.Count; i++)
        {
            var folderNode = _appRootNode.Children[i].FindFolderNode(folderId);
            if (folderNode != null)
                return folderNode;
        }

        return null;
    }

    public ModelNode? FindModelNode(ModelId modelId)
        => FindModelRootNode(modelId.AppId, modelId.Type)?.FindModelNode(modelId);

    public ModelNode? FindModelNodeByName(int appId, ModelType modelType, ReadOnlyMemory<char> name)
        => FindModelRootNode(appId, modelType)?.FindModelNodeByName(name);

    public ModelNode? FindModelNodeByFullName(string fullName)
        => FindModelNodeByFullName(fullName.AsMemory());

    /// <summary>
    /// 根据全名称找到模型节点
    /// </summary>
    /// <param name="fullName">eg: sys.Entities.Employee</param>
    public ModelNode? FindModelNodeByFullName(ReadOnlyMemory<char> fullName)
    {
        var firstDot = fullName.Span.IndexOf('.');
        var lastDot = fullName.Span.LastIndexOf('.');
        var appName = fullName.Slice(0, firstDot);
        var typeName = fullName.Slice(firstDot + 1, lastDot - firstDot - 1);
        var modelName = fullName.Slice(lastDot + 1);

        var appNode = FindApplicationNodeByName(appName);
        if (appNode == null) return null;
        var modelType = CodeUtil.GetModelTypeFromPluralString(typeName.Span);
              
        return FindModelNodeByName(appNode.Model.Id, modelType, modelName);
    }

    /// <summary>
    /// 根据当前选择的节点查询新建模型的上级节点
    /// </summary>
    public static DesignNode? FindNewModelParentNode(DesignNode? node, ModelType newModelType)
    {
        if (node == null) return null;

        switch (node.Type)
        {
            case DesignNodeType.FolderNode:
            {
                var folderNode = (FolderNode)node;
                if (folderNode.Folder.TargetModelType == newModelType)
                    return folderNode;
                break;
            }
            case DesignNodeType.ModelRootNode:
            {
                var modelRootNode = (ModelRootNode)node;
                if (modelRootNode.TargetType == newModelType)
                    return modelRootNode;
                break;
            }
            case DesignNodeType.ApplicationNode:
                return ((ApplicationNode)node).FindModelRootNode(newModelType);
            case DesignNodeType.ModelNode:
                break;
            default:
                return null;
        }

        return FindNewModelParentNode(node.Parent, newModelType);
    }
    
    /// <summary>
    /// 根据当前选择的节点查找新建文件夹节点的上级节点
    /// </summary>
    public static DesignNode? FindNewFolderParentNode(DesignNode selected, out int appID, out ModelType modelType)
    {
        appID = 0;
        modelType = ModelType.Entity;

        if (selected is ModelRootNode rootNode)
        {
            appID = ((ApplicationNode)rootNode.Parent!).Model.Id;
            modelType = rootNode.TargetType;
            return selected;
        }
        if (selected.Type == DesignNodeType.FolderNode)
        {
            var folder = ((FolderNode)selected).Folder;
            appID = folder.AppId;
            modelType = folder.TargetModelType;
            return selected;
        }

        return null;
    }

    /// <summary>
    /// 向上递归查找指定节点所属的应用节点
    /// </summary>
    public static ApplicationNode? FindAppNodeFromNode(DesignNode? node)
    {
        while (true)
        {
            if (node == null) return null;
            if (node.Type == DesignNodeType.ApplicationNode) return (ApplicationNode)node;
            node = node.Parent;
        }
    }

    /// <summary>
    /// 设计时新建模型时检查名称是否已存在
    /// </summary>
    public bool IsModelNameExists(int appId, ModelType modelType, ReadOnlyMemory<char> name)
    {
        //TODO:***** 如果forNew = true,考虑在这里加载存储有没有相同名称的存在,或发布时检测，如改为全局Workspace没有此问题
        // dev1 -> load tree -> checkout -> add model -> publish
        // dev2 -> load tree                                 -> checkout -> add model with same name will pass
        var found = FindModelNodeByName(appId, modelType, name);
        return found != null;
    }

    public ModelNode[] FindNodesByType(ModelType modelType)
    {
        var list = new List<ModelNode>();
        for (var i = 0; i < _appRootNode.Children.Count; i++)
        {
            var appNode = _appRootNode.Children[i];
            var modelRootNode = appNode.FindModelRootNode(modelType);
            list.AddRange(modelRootNode.GetAllModelNodes());
        }

        return list.ToArray();
    }

    /// <summary>
    /// 查找所有引用指定模型标识的EntityRef Member集合
    /// </summary>
    public List<EntityRefModel> FindAllEntityRefs(ModelId targetEntityModelId)
    {
        var rs = new List<EntityRefModel>();

        var allEntities = FindNodesByType(ModelType.Entity);
        for (var i = 0; i < allEntities.Length; i++)
        {
            var model = (EntityModel)allEntities[i].Model;
            //注意：不能排除自身引用，主要指树状结构的实体
            for (var j = 0; j < model.Members.Count; j++)
            {
                if (model.Members[j].Type == EntityMemberType.EntityRef)
                {
                    var refMember = (EntityRefModel)model.Members[j];
                    //注意不排除聚合引用
                    for (var k = 0; k < refMember.RefModelIds.Count; k++)
                    {
                        if (refMember.RefModelIds[k] == targetEntityModelId.Value)
                            rs.Add(refMember);
                    }
                }
            }
        }

        return rs;
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
                var stagedModel = Staged!.FindModel(modelNode.Model.Id);
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