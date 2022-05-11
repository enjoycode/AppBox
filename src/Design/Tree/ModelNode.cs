using AppBoxCore;

namespace AppBoxDesign;

public sealed class ModelNode : DesignNode
{
    private readonly ModelBase _model;

    public ModelNode(ModelBase model)
    {
        _model = model;
    }

    public override DesignNodeType Type => DesignNodeType.ModelNode;
    public override string Id => _model.Id.ToString();
    public override string Label => _model.Name;

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

        ws.WriteByte((byte)_model.ModelType);
    }
}