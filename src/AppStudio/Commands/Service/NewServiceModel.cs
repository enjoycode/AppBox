using AppBoxCore;

namespace AppBoxDesign;

internal static class NewServiceModel
{
    internal static Task<NewNodeResult> Execute(DesignNode selectedNode, string name)
    {
        return ModelCreator.Make(DesignHub.Current, ModelType.Service,
            id => new ServiceModel(id, name),
            selectedNode.Type, selectedNode.Id, name,
            appName => $$"""

                         public sealed class {{name}}
                         {
                             public string SayHello()
                             {
                                 return "Hello World";
                             }
                         }
                         """);
    }
}