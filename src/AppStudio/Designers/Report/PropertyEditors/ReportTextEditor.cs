using PixUI;

namespace AppBoxDesign.Diagram.PropertyEditors;

/// <summary>
/// 专用于报表的文本属性编辑器，支持绑定表达式
/// </summary>
internal sealed class ReportTextEditor : SingleChildWidget
{
    public ReportTextEditor(IDiagramProperty propertyItem)
    {
        var valueState = new RxProxy<string>(
            () => propertyItem.ValueGetter()?.ToString() ?? string.Empty,
            v =>
            {
                propertyItem.ValueSetter!(v);
                if (propertyItem.InvalidateAfterChanged)
                    propertyItem.Invalidate();
            }
        );

        Child = new TextInput(valueState);
    }
}