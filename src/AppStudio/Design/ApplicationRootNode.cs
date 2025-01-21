using PixUI;

namespace AppBoxDesign;

public sealed class ApplicationRootNode : DesignNode, IRootNode, IChildrenNode
{
    public ApplicationRootNode(DesignTree tree)
    {
        DesignTree = tree;
        Children = new DesignNodeList<ApplicationNode>(this);
    }
    
    private static readonly State<string> LabelState = "Applications";

    public override DesignNodeType Type => DesignNodeType.ApplicationRoot;
    public override State<string> Label => LabelState;

    internal DesignNodeList<ApplicationNode> Children { get; }

    public new DesignTree DesignTree { get; }
    
    public IList<DesignNode> GetChildren() => Children.List.Cast<DesignNode>().ToList();
}