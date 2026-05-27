using PixUI;

namespace AppBoxDesign.Diagram;

internal sealed class TextEditor : SingleChildWidget
{
    public TextEditor(IDiagramProperty propertyItem)
    {
        Action<string>? valueSetter = propertyItem.ValueSetter == null
            ? null
            : v =>
            {
                propertyItem.ValueSetter!(v);
                if (propertyItem.InvalidateAfterChanged)
                    propertyItem.Invalidate();
            };

        var valueState = new RxProxy<string>(
            () => propertyItem.ValueGetter()?.ToString() ?? string.Empty,
            valueSetter
        );

        Child = new TextInput(valueState) { Readonly = propertyItem.Readonly };
    }
}