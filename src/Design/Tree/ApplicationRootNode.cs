using AppBoxCore;

namespace AppBoxDesign;

public sealed class ApplicationRootNode : DesignNode, IRootNode
{
    public override DesignNodeType Type => DesignNodeType.ApplicationRoot;
    public override string Label => "Applications";

    internal DesignNodeList<ApplicationNode> Children { get; }

    public DesignTree DesignTree { get; }

    public ApplicationRootNode(DesignTree tree)
    {
        DesignTree = tree;
        Children = new DesignNodeList<ApplicationNode>(this);
    }

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);
        Children.WriteTo(ws);
    }
}