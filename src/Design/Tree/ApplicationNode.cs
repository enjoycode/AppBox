using AppBoxCore;

namespace AppBoxDesign;

public sealed class ApplicationNode : DesignNode
{
    public ApplicationNode(DesignTree tree, ApplicationModel model)
    {
        Model = model;
        _children = new DesignNodeList<ModelRootNode>(this);

        //按ModelType项顺序添加模型根节点
        for (var i = 0; i < 8; i++)
        {
            var modelRoot = new ModelRootNode((ModelType)i);
            _children.Add(modelRoot);
            tree.BindCheckoutInfo(modelRoot, false);
        }
    }

    public readonly ApplicationModel Model;
    private readonly DesignNodeList<ModelRootNode> _children;

    public override DesignNodeType Type => DesignNodeType.ApplicationNode;
    public override string Label => Model.Name;

    /// <summary>
    /// 签入当前应用节点下所有子节点
    /// </summary>
    internal void CheckinAllNodes()
    {
        for (var i = 0; i < _children.Count; i++)
        {
            _children[i].CheckInAllNodes();
        }
    }

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);
        _children.WriteTo(ws);
    }

    public ModelRootNode FindModelRootNode(ModelType modelType)
        => _children[(int)modelType];
}