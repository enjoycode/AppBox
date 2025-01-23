using AppBoxCore;

namespace AppBoxDesign;

internal static class NewViewModel
{
    internal static Task<NewNodeResult> Execute(DesignNode selectedNode, string name, bool isDynamic)
    {
        var selectedNodeType = selectedNode.Type;
        var selectedNodeId = selectedNode.Id;

        if (isDynamic)
        {
            return ModelCreator.Make(DesignHub.Current, ModelType.View,
                id => new ViewModel(id, name, ViewModelType.PixUIDynamic),
                selectedNodeType, selectedNodeId, name,
                _ => """
                     {
                       "Root": {
                         "Type": "Center",
                         "Child": {
                           "Type": "Button",
                           "Text": { "Const": "Button" }
                         }
                       }
                     }
                     """
            );
        }
        else
        {
            return ModelCreator.Make(DesignHub.Current, ModelType.View,
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
        }
    }
}