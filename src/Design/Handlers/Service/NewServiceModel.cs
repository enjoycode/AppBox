using AppBoxCore;

namespace AppBoxDesign;

internal sealed class NewServiceModel : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var selectedNodeType = (DesignNodeType)args.GetInt();
        var selectedNodeId = args.GetString()!;
        var name = args.GetString()!;

        var initSrcCode = $@"public sealed class {name}
{{
    public string SayHello()
    {{
        return ""Hello World"";
    }}
}}";

        var result = await ModelCreator.Make(hub, ModelType.Service,
            id => new ServiceModel(id, name),
            selectedNodeType, selectedNodeId, name, initSrcCode);
        return AnyValue.From(result);
    }
}