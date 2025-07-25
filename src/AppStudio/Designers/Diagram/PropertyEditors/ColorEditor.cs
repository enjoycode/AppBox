using PixUI;

namespace AppBoxDesign.Diagram.PropertyEditors;

internal sealed class ColorEditor : SingleChildWidget
{
    public ColorEditor(IDiagramProperty propertyItem)
    {
        var valueState = new RxProxy<Color>(
            () =>
            {
                if (propertyItem.ValueGetter() is Color color)
                    return color;
                return Color.Empty;
            },
            v =>
            {
                propertyItem.ValueSetter!(v);
                if (propertyItem.InvalidateAfterChanged)
                    propertyItem.Invalidate();
            }
        );

        Child = new ColorPicker(valueState);
    }
}