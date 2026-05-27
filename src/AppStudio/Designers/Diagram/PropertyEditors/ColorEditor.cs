using PixUI;

namespace AppBoxDesign.Diagram;

internal sealed class ColorEditor : SingleChildWidget
{
    internal static EditorFactory Factory => (_, prop) => new ColorEditor(prop);
    
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