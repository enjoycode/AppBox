using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class PieSeriesPropEditor : SingleChildWidget
{
    public PieSeriesPropEditor(State<PieSeriesSettings?> state)
    {
        _state = state;
        Child = new Button("...") { Width = float.MaxValue, OnTap = OnTap };
    }

    private readonly State<PieSeriesSettings?> _state;

    private DesignController? DesignController =>
        Parent is PixUI.Dynamic.Design.PropertyEditor propertyEditor ? propertyEditor.DesignController : null;

    private async void OnTap(PointerEvent e)
    {
        //TODO: test now
        _state.Value = new PieSeriesSettings()
        {
            DataSet = "orders",
            Field = "Sales",
            Name = "Month",
        };
        
        // if (DesignController == null) return;
        //
        // //编辑副本
        // var list = new List<CartesianSeriesSettings>();
        // if (_state.Value is { Length: > 0 })
        //     list.AddRange(_state.Value.Select(t => t.Clone()));
        //
        // var dlg = new CartesianSeriesDialog(list, DesignController);
        // var canceled = await dlg.ShowAndWaitClose();
        // if (canceled) return;
        //
        // _state.Value = list.ToArray();
    }
}