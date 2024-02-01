using AppBoxCore;

namespace AppBoxDesign;

internal sealed class NewPermissionModel : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var selectedNodeType = (DesignNodeType)args.GetInt()!.Value;
        var selectedNodeId = args.GetString()!;
        var name = args.GetString()!;

        var result = await ModelCreator.Make(hub, ModelType.Permission,
            id => new PermissionModel(id, name),
            selectedNodeType, selectedNodeId, name, _ => null);

        return AnyValue.From(result);
    }
}