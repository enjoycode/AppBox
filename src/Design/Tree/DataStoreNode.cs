using AppBoxCore;

namespace AppBoxDesign;

public sealed class DataStoreNode : DesignNode
{
    private readonly DataStoreModel _model;

    public DataStoreNode(DataStoreModel model)
    {
        _model = model;
    }
    
    public override DesignNodeType Type => DesignNodeType.DataStoreNode;
    public override string Label => _model.Name;
    public override string Id => ((ulong)_model.Id).ToString();
}