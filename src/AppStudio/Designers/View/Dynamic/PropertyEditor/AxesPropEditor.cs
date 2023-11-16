using System.Collections.Generic;
using System.Linq;
using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class AxesPropEditor : SingleChildWidget
{
    public AxesPropEditor(State<AxisSettings[]> state)
    {
        _state = state;
        Child = new Button("...") { Width = float.MaxValue, OnTap = OnTap };
    }

    private readonly State<AxisSettings[]> _state;

    private DesignController? DesignController =>
        Parent is PixUI.Dynamic.Design.PropertyEditor propertyEditor ? propertyEditor.DesignController : null;

    private async void OnTap(PointerEvent e)
    {
        if (DesignController == null) return;

        //编辑副本
        var list = new List<AxisSettings>();
        if (_state.Value is { Length: > 0 })
            list.AddRange(_state.Value.Select(t => t.Clone()));

        var dlg = new AxesDialog(list, DesignController);
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK) return;

        _state.Value = list.ToArray();
    }
}