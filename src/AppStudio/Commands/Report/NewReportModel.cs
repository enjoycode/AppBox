using AppBoxCore;

namespace AppBoxDesign;

internal static class NewReportModel
{
    internal static Task<NewNodeResult> Execute(DesignNode selectedNode, string name)
    {
        return ModelCreator.Make(DesignHub.Current, ModelType.Report,
            id => new ReportModel(id, name),
            selectedNode.Type, selectedNode.Id, name,
            _ => $$"""
                   {
                     "Width": "21cm",
                     "Items": [
                       {
                         "$T": "PageHeader",
                         "Height": "2cm",
                         "Items": [
                           {"$T": "TextBox", "Width": "3cm", "Height": "1cm", "Left": "5cm", "Top": "1cm", "Value": "Header"}
                         ]
                       },
                       {
                         "$T": "Details",
                         "Height": "5cm",
                         "Items": [
                           { 
                             "$T": "TextBox", "Width": "3cm", "Height": "1cm", "Left": "5cm", "Top": "1cm", "Value": "Hello Future",
                             "Style": { "Color": "Red", "VerticalAlign": "Middle", "BorderStyle": { "Default": "Solid" }, "Font": { "Size": "12pt" } }
                           }
                         ]
                       }
                     ]
                   }
                   """);
    }
}