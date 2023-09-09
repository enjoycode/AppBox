using AppBoxClient.Dynamic;
using PixUI;

namespace AppBoxDesign.PropertyEditor;

internal sealed class CartesianSeriesEditor : SingleChildWidget
{
    public CartesianSeriesEditor(State<CartesianSeriesSettings[]> state)
    {
        _state = state;
        Child = new Button("...") { Width = float.MaxValue, OnTap = OnTap };
    }

    private readonly State<CartesianSeriesSettings[]> _state;

    private void OnTap(PointerEvent e)
    {
        //TODO: test only now
        _state.Value = new CartesianSeriesSettings[]
        {
            new LineSeriesSettings() {DataSetName = "orders", FieldName = "Sales"}
        };
    }
}