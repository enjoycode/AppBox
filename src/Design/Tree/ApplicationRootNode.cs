using AppBoxCore;

namespace AppBoxDesign;

public sealed class ApplicationRootNode : DesignNode, IRootNode
{
    public readonly NodeList<ApplicationNode> Children;

    public override DesignNodeType NodeType => DesignNodeType.ApplicationRoot;
    public override string Label => "Applications";

    public DesignTree DesignTree { get; }

    public ApplicationRootNode(DesignTree tree)
    {
        DesignTree = tree;
        Children = new NodeList<ApplicationNode>(this);
    }

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);
        Children.WriteTo(ws);
    }
}