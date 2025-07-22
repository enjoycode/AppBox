using PixUI;

namespace AppBoxDesign.Diagram.PropertyEditors;

internal sealed class CheckBoxEditor : SingleChildWidget
{
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