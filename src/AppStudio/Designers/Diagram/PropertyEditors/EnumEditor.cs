using PixUI;

namespace AppBoxDesign.Diagram.PropertyEditors;

internal sealed class EnumEditor : SingleChildWidget
{
    public EnumEditor(IDiagramProperty propertyItem)
    {
        var enumType = (Type)propertyItem.EditorOptions!;
        var defaultValue = Activator.CreateInstance(enumType)!;

        var valueState = new RxProxy<string?>(
            () => propertyItem.ValueGetter()?.ToString(),
            v =>
            {
                //TODO: should check allow null for property
                var enumValue = string.IsNullOrEmpty(v) ? defaultValue : Enum.Parse(enumType, v);
                propertyItem.ValueSetter!(enumValue);
                if (propertyItem.InvalidateAfterChanged)
                    propertyItem.Invalidate();
            }
        );

        Child = new Select<string>(valueState)
        {
            Options = Enum.GetNames(enumType)
        };
    }
}