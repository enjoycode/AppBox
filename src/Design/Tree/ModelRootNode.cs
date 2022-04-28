using AppBoxCore;

namespace AppBoxDesign;

public sealed class ModelRootNode : DesignNode
{
    public readonly ModelType TargetType;
    
    public override DesignNodeType NodeType => DesignNodeType.ModelRootNode;
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
    }

    internal void CheckInAllNodes()
    {
        throw new NotImplementedException();
    }
}