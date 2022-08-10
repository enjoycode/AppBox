using AppBoxCore;

namespace AppBoxDesign;

public sealed class DataStoreNode : DesignNode
{
    internal readonly DataStoreModel Model;

    public DataStoreNode(DataStoreModel model)
    {
        Model = model;
    }

    public override DesignNodeType Type => DesignNodeType.DataStoreNode;
    public override string Label => Model.Name;
    public override string Id => ((ulong)Model.Id).ToString();
}