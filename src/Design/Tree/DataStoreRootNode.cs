namespace AppBoxDesign;

public sealed class DataStoreRootNode : DesignNode, IRootNode
{
    public override DesignNodeType Type => DesignNodeType.DataStoreRootNode;
    public override string Label => "DataStore";
    public DesignTree DesignTree { get; }

    public DataStoreRootNode(DesignTree tree)
    {
        DesignTree = tree;
    }
}