using AppBoxCore;

namespace AppBoxDesign;

public sealed class DataStoreRootNode : DesignNode, IRootNode
{
    internal NodeList<DataStoreNode> Children { get; }

    public override DesignNodeType Type => DesignNodeType.DataStoreRootNode;
    public override string Label => "DataStore";
    public DesignTree DesignTree { get; }

    public DataStoreRootNode(DesignTree tree)
    {
        DesignTree = tree;
        Children = new NodeList<DataStoreNode>(this);
    }
    
    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);
        Children.WriteTo(ws);
    }
    
}