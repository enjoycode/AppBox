using AppBoxCore;

namespace AppBoxDesign;

public sealed class ApplicationNode : DesignNode
{
    public readonly ApplicationModel Model;
    public readonly NodeList<ModelRootNode> Children;

    public override DesignNodeType NodeType => DesignNodeType.ApplicationNode;
    public override string Label => Model.Name;

    public ApplicationNode(DesignTree tree, ApplicationModel model)
    {
        Model = model;
        Children = new NodeList<ModelRootNode>(this);

        //按ModelType项顺序添加模型根节点
        for (var i = 0; i < 8; i++)
        {
            var modelRoot = new ModelRootNode((ModelType)i);
            Children.Add(modelRoot);
            tree.BindCheckoutInfo(modelRoot, false);
        }
    }

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);
        Children.WriteTo(ws);
    }

    public ModelRootNode FindModelRootNode(ModelType modelType)
        => Children[(int)modelType];
}