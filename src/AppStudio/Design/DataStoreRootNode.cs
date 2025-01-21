using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

public sealed class DataStoreRootNode : DesignNode, IRootNode, IChildrenNode
{
    public DataStoreRootNode(DesignTree tree)
    {
        DesignTree = tree;
        Children = new DesignNodeList<DataStoreNode>(this);
    }
    
    private static readonly State<string> LabelState = "DataStore";

    internal DesignNodeList<DataStoreNode> Children { get; }

    public override DesignNodeType Type => DesignNodeType.DataStoreRootNode;
    public override State<string> Label => LabelState;
    public new DesignTree DesignTree { get; }
    
    public IList<DesignNode> GetChildren() => Children.List.Cast<DesignNode>().ToList();
}