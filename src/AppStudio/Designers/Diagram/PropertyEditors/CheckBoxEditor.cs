using PixUI;

namespace AppBoxDesign.Diagram;

internal sealed class CheckBoxEditor : SingleChildWidget
{
    internal static EditorFactory Factory => (_, prop) => new CheckBoxEditor(prop);

    public CheckBoxEditor(IDiagramProperty propertyItem)
    {
        var valueState = new RxProxy<bool>(
            () => propertyItem.ValueGetter() is true,
            v =>
            {
                propertyItem.ValueSetter!(v);
                if (propertyItem.InvalidateAfterChanged)
                    propertyItem.Invalidate();
            }
        );

        Child = new Checkbox(valueState);
    }
}