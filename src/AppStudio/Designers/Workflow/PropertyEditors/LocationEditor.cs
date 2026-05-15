using AppBoxDesign.Diagram;
using PixUI;

namespace AppBoxDesign.Workflow;

internal sealed class LocationEditor : SingleChildWidget, IValueStateEditor
{
    public LocationEditor(IDiagramProperty propertyItem)
    {
        _inputState = new RxProxy<float>(
            () => (float)propertyItem.ValueGetter()!,
            v =>
            {
                if (propertyItem.ValueSetter != null)
                {
                    propertyItem.ValueSetter(v);
                    if (propertyItem.InvalidateAfterChanged)
                        propertyItem.Invalidate();
                }
            });

        NotifyValueChanged();

        Child = new NumberInput<float>(_inputState);
    }

    private readonly State<float> _inputState;

    public void NotifyValueChanged() => _inputState.NotifyValueChanged();
}