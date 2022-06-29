using AppBoxCore;

namespace AppBoxDesign;

public sealed class ModelRootNode : DesignNode
{
    public ModelRootNode(ModelType targetType)
    {
        TargetType = targetType;
        Children = new DesignNodeList<DesignNode>(this);
    }

    private readonly Dictionary<Guid, FolderNode> _folders = new();
    private readonly Dictionary<ModelId, ModelNode> _models = new();

    public ModelFolder? RootFolder { get; internal set; }

    public readonly ModelType TargetType;

    internal DesignNodeList<DesignNode> Children { get; }

    public override DesignNodeType Type => DesignNodeType.ModelRootNode;
    public override string Label => CodeUtil.GetPluralStringOfModelType(TargetType);

    public override string Id
    {
        get
        {
            var appModel = ((ApplicationNode)Parent!).Model;
            var appIdString = ((uint)appModel.Id).ToString();
            return $"{appIdString}-{(byte)TargetType}";
        }
    }

    #region ====Add and Remove Methods====
    
    /// <summary>
    /// 用于新建时添加至字典表
    /// </summary>
    internal void AddModelIndex(ModelNode node) => _models.Add(node.Model.Id, node);

    /// <summary>
    /// 用于新建时添加至字典表
    /// </summary>
    internal void AddFolderIndex(FolderNode node) => _folders.Add(node.Folder.Id, node);
    
    /// <summary>
    /// 删除并移除字典表中对应的键
    /// </summary>
    internal void RemoveModel(ModelNode node)
    {
        if (node.Parent is FolderNode folderNode)
            folderNode.Children.Remove(node);
        else
            Children.Remove(node);
        _models.Remove(node.Model.Id);
    }

    /// <summary>
    /// 仅用于设计树从顶级开始递归添加文件夹节点
    /// </summary>
    internal void LoadFolder(ModelFolder folder, FolderNode? parent = null)
    {
        FolderNode? parentNode = null;
        if (folder.Parent != null)
        {
            var node = new FolderNode(folder);
            parentNode = node;
            //不再检查本地有没有挂起的修改,由DesignTree加载时处理好
            if (parent == null)
                Children.Add(node);
            else
                parent.Children.Add(node);

            _folders.Add(folder.Id, node);
        }
        else
        {
            RootFolder = folder;
        }

        if (folder.HasChilds)
        {
            foreach (var child in folder.Children)
            {
                LoadFolder(child, parentNode);
            }
        }
    }

    /// <summary>
    /// 仅用于加载设计树时添加节点并绑定签出信息
    /// </summary>
    internal ModelNode LoadModel(ModelBase model)
    {
        //注意: 1.不在这里创建相应的RoslynDocument,因为可能生成虚拟代码时找不到引用的模型，待加载完整个树后再创建
        //     2.model可能被签出的本地替换掉，所以相关操作必须指向node.Model
        var node = new ModelNode(model, DesignTree!.DesignHub);
        DesignTree.BindCheckoutInfo(node, model.PersistentState == PersistentState.Detached);

        if (node.Model.FolderId.HasValue &&
            _folders.TryGetValue(node.Model.FolderId.Value, out var folderNode))
        {
            folderNode.Children.Add(node);
        }
        else
        {
            Children.Add(node);
        }

        _models.Add(node.Model.Id, node);
        return node;
    }

    #endregion

    #region ====Find Methods====

    public FolderNode? FindFolderNode(Guid folderID)
    {
        _folders.TryGetValue(folderID, out var node);
        return node;
    }

    public ModelNode? FindModelNode(ModelId modelId)
        => _models.TryGetValue(modelId, out var modelNode) ? modelNode : null;

    public ModelNode? FindModelNodeByName(ReadOnlyMemory<char> name)
        => _models.Values.FirstOrDefault(t => t.Model.Name.AsSpan().SequenceEqual(name.Span));

    #endregion

    internal void CheckInAllNodes()
    {
        //定义待删除模型节点列表
        var ls = new List<ModelNode>();

        //签入模型根节点，文件夹的签出信息同模型根节点
        if (IsCheckoutByMe)
            CheckoutInfo = null;

        //签入所有模型节点
        foreach (var n in _models.Values)
        {
            if (n.IsCheckoutByMe)
            {
                //判断是否待删除的节点
                if (n.Model.PersistentState == PersistentState.Deleted)
                {
                    ls.Add(n);
                }
                else
                {
                    n.CheckoutInfo = null;
                    //不再需要累加版本号，由ModelStore保存模型时处理 n.Model.Version += 1;
                    n.Model.AcceptChanges();
                }
            }
        }

        //TODO:移除已删除的文件夹节点
        //开始移除待删除的模型节点
        foreach (var modelNode in ls)
        {
            //先移除索引
            _models.Remove(modelNode.Model.Id);
            //再移除节点
            var parentNode = modelNode.Parent;
            switch (parentNode)
            {
                case FolderNode folderNode:
                    folderNode.Children.Remove(modelNode);
                    break;
                case ModelRootNode modelRootNode:
                    modelRootNode.Children.Remove(modelNode);
                    break;
                default: throw new Exception("Can't remove");
            }
        }
    }

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);
        Children.WriteTo(ws);
    }
}