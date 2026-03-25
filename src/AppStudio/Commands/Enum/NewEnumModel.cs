using AppBoxCore;

namespace AppBoxDesign;

internal static class NewEnumModel
{
    internal static Task<NewNodeResult> Execute(DesignNode selectedNode, string name)
    {
        return ModelCreator.Make(DesignHub.Current, ModelType.Enum,
            id => new EnumModel(id, name),
            selectedNode.Type, selectedNode.Id, name, _ => null);
    }
}