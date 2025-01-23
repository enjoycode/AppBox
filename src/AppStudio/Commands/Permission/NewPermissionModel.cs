using AppBoxCore;

namespace AppBoxDesign;

internal static class NewPermissionModel
{
    internal static Task<NewNodeResult> Execute(DesignNode selectedNode, string name)
    {
        return ModelCreator.Make(DesignHub.Current, ModelType.Permission,
            id => new PermissionModel(id, name),
            selectedNode.Type, selectedNode.Id, name, _ => null);
    }
}