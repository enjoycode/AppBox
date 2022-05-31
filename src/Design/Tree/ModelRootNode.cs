using AppBoxCore;

namespace AppBoxDesign;

public sealed class ModelRootNode : DesignNode
{
    private readonly Dictionary<ModelId, ModelNode> _models = new();

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

    public ModelRootNode(ModelType targetType)
    {
        TargetType = targetType;
        Children = new DesignNodeList<DesignNode>(this);
    }

    #region ====Add and Remove Methods====

    /// <summary>
    /// 仅用于加载设计树时添加节点并绑定签出信息
    /// </summary>
    internal ModelNode AddModelForLoad(ModelBase model)
    {
        //注意: 1.不在这里创建相应的RoslynDocument,因为可能生成虚拟代码时找不到引用的模型，待加载完整个树后再创建
        //     2.model可能被签出的本地替换掉，所以相关操作必须指向node.Model
        var node = new ModelNode(model, DesignTree!.DesignHub);
        // DesignTree.BindCheckoutInfo(node, model.PersistentState == PersistentState.Detached);

        // if (node.Model.FolderId.HasValue)
        // {
        //     if (_folders.TryGetValue(node.Model.FolderId.Value, out FolderNode folderNode))
        //         folderNode.Nodes.Add(node);
        //     else
        //         Nodes.Add(node);
        // }
        // else
        // {
        Children.Add(node);
        // }
        _models.Add(node.Model.Id, node);
        return node;
    }

    #endregion

    #region ====Find Methods====

    public ModelNode? FindModelNode(ModelId modelId)
        => _models.TryGetValue(modelId, out var modelNode) ? modelNode : null;

    public ModelNode? FindModelNodeByName(ReadOnlyMemory<char> name)
        => _models.Values.FirstOrDefault(t => t.Model.Name.AsSpan().SequenceEqual(name.Span));

    #endregion

    internal void CheckInAllNodes()
    {
        throw new NotImplementedException();
    }

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);
        Children.WriteTo(ws);
    }
}