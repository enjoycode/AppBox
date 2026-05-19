using PixUI;

namespace AppBoxDesign.Diagram;

internal sealed class TextEditor : SingleChildWidget
{
    public TextEditor(IDiagramProperty propertyItem)
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