using AppBoxCore;

namespace AppBoxDesign;

public sealed class ApplicationRootNode : DesignNode, IRootNode
{
    private readonly NodeList<ApplicationNode> _children;

    public override IList<IDesignNode>? Children => _children.ToList();

    public override DesignNodeType Type => DesignNodeType.ApplicationRoot;
    public override string Label => "Applications";

    public DesignTree DesignTree { get; }

    public ApplicationRootNode(DesignTree tree)
    {
        DesignTree = tree;
        _children = new NodeList<ApplicationNode>(this);
    }

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);
        _children.WriteTo(ws);
    }
}