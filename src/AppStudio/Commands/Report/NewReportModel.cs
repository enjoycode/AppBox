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
                     "PageSettings": {"PaperSize":["21cm","29.7cm"]},
                     "Items": [
                       {
                         "$T": "PageHeader",
                         "Height": "2cm",
                         "Items": [
                           {"$T": "TextBox", "Width": "3cm", "Height": "1cm", "Left": "5cm", "Top": "0.5cm", "Value": "Header"}
                         ]
                       },
                       {
                         "$T": "Details",
                         "Height": "5cm",
                         "Items": [
                           { 
                             "$T": "TextBox", "Width": "3cm", "Height": "1cm", "Left": "5cm", "Top": "1cm", "Value": "Hello Future",
                             "Style": { "Color": "FFFF0000", "VerticalAlign": "Middle", "BorderStyle": { "Default": "Solid" }, "Font": { "Size": "12pt" } }
                           }
                         ]
                       }
                     ]
                   }
                   """);
    }
}