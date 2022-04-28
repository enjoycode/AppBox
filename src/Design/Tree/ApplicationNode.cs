using AppBoxCore;

namespace AppBoxDesign;

public sealed class ApplicationNode : DesignNode
{
    public readonly ApplicationModel Model;
    private readonly NodeList<ModelRootNode> _children;

    public override IList<IDesignNode>? Children => _children.ToList();

    public override DesignNodeType Type => DesignNodeType.ApplicationNode;
    public override string Label => Model.Name;

    public ApplicationNode(DesignTree tree, ApplicationModel model)
    {
        Model = model;
        _children = new NodeList<ModelRootNode>(this);

        //按ModelType项顺序添加模型根节点
        for (var i = 0; i < 8; i++)
        {
            var modelRoot = new ModelRootNode((ModelType)i);
            _children.Add(modelRoot);
            tree.BindCheckoutInfo(modelRoot, false);
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