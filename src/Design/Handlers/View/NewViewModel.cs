using AppBoxCore;

namespace AppBoxDesign;

internal sealed class NewViewModel : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var selectedNodeType = (DesignNodeType)args.GetInt();
        var selectedNodeId = args.GetString()!;
        var name = args.GetString()!;
        var isDynamic = args.GetBool();

        if (isDynamic)
        {
            var result = await ModelCreator.Make(hub, ModelType.View,
                id => new ViewModel(id, name, ViewModelType.PixUIDynamic),
                selectedNodeType, selectedNodeId, name,
                appName => """
                           {
                             "Root": {
                               "Type": "Center",
                               "Child": {
                                 "Type": "Button"
                               }
                             }
                           }
                           """
            );

            return AnyValue.From(result);
        }
        else
        {
            var result = await ModelCreator.Make(hub, ModelType.View,
                id => new ViewModel(id, name),
                selectedNodeType, selectedNodeId, name,
                appName => $$"""
                             namespace {{appName}}.Views;

                             public sealed class {{name}} : View
                             {
                                 public {{name}}()
                                 {
                                     Child = new Center()
                                     {
                                         Child = new Text("Hello World") { FontSize = 50 }
                                     };
                                 }
                             }
                             """);

            return AnyValue.From(result);
        }
    }
}