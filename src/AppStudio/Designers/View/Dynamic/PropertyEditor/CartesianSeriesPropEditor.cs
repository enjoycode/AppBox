using System.Collections.Generic;
using System.Linq;
using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class CartesianSeriesPropEditor : ValueEditorBase
{
    public CartesianSeriesPropEditor(State<CartesianSeriesSettings[]> state, DesignController controller) :
        base(controller)
    {
        _state = state;
        Child = new Button("...") { Width = float.MaxValue, OnTap = OnTap };
    }

    private readonly State<CartesianSeriesSettings[]> _state;

    private async void OnTap(PointerEvent e)
    {
        //编辑副本
        var list = new List<CartesianSeriesSettings>();
        if (_state.Value is { Length: > 0 })
            list.AddRange(_state.Value.Select(t => t.Clone()));

        var dlg = new CartesianSeriesDialog(list, Controller);
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK) return;

        _state.Value = list.ToArray();
    }
}