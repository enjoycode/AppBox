using AppBoxCore;

namespace AppBoxDesign;

public sealed class ModelRootNode : DesignNode
{
    public readonly ModelType TargetType;

    internal DesignNodeList<DesignNode> Children { get; }

    public override DesignNodeType Type => DesignNodeType.ModelRootNode;
    public override string Label => CodeUtil.GetPluralStringOfModelType(TargetType);

    public override string Id
    {
        get
        {
            var appModel = ((ApplicationNode)Parent!).Model;
            var appIdString = ((uint)appModel.Id).ToString();
            return $"{appIdString}-{(byte)TargetType}";
        }
    }

    public ModelRootNode(ModelType targetType)
    {
        TargetType = targetType;
        Children = new DesignNodeList<DesignNode>(this);
    }

    internal void CheckInAllNodes()
    {
        throw new NotImplementedException();
    }

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);
        Children.WriteTo(ws);
    }
}