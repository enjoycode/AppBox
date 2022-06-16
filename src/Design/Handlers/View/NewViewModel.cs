using AppBoxCore;

namespace AppBoxDesign;

internal sealed class NewViewModel : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var selectedNodeType = (DesignNodeType)args.GetInt();
        var selectedNodeId = args.GetString()!;
        var name = args.GetString()!;

        var initSrcCode = $@"using PixUI;

public sealed class {name} : View
{{
    public {name}()
    {{
        Child = new Center()
        {{
            Child = new Text(""Hello World"") {{ FontSize = 50 }}
        }};
    }}
}}";

        var result = await ModelCreator.Make(hub, ModelType.View, id => new ViewModel(id, name),
            selectedNodeType, selectedNodeId, name, initSrcCode);
        return AnyValue.From(result);
    }
}