using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.Diagram.PropertyEditors;

internal static class PropertyEditorFactory
{
    public static Widget CreateEditor(DiagramPropertyItem propertyItem) => propertyItem.EditorName switch
    {
        "ReportText" => new ReportTextEditor(propertyItem),
        _ => throw new NotImplementedException(propertyItem.EditorName)
    };
}