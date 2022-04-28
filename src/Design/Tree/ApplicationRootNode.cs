using AppBoxCore;

namespace AppBoxDesign;

public sealed class ApplicationRootNode : DesignNode, IRootNode
{
    private readonly NodeList<ApplicationNode> _children;

    public override IList<DesignNode>? Children => _children.ToList();

    public override DesignNodeType NodeType => DesignNodeType.ApplicationRoot;
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