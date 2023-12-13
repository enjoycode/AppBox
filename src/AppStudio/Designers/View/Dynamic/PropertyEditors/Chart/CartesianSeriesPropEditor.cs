using System.Collections.Generic;
using System.Linq;
using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditors;

internal sealed class CartesianSeriesPropEditor : ValueEditorBase
{
    public CartesianSeriesPropEditor(State<CartesianSeriesSettings[]> state, DesignElement element) : base(element)
    {
        _state = state;
        Child = new Button("...") { Width = float.MaxValue, OnTap = OnTap };
    }

    private readonly State<CartesianSeriesSettings[]> _state;

    private async void OnTap(PointerEvent e)
    {
        //先判断有没有设置DataSet
        Element.Data.TryGetPropertyValue(nameof(DynamicCartesianChart.DataSet), out var datasetValue);
        if (datasetValue?.Value.Value is not string dsName || string.IsNullOrEmpty(dsName))
        {
            Notification.Warn("尚未设置DataSet");
            return;
        }
        
        //编辑副本
        var list = new List<CartesianSeriesSettings>();
        if (_state.Value is { Length: > 0 })
            list.AddRange(_state.Value.Select(t => t.Clone()));

        var dlg = new CartesianSeriesDialog(list, Element);
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK) return;

        _state.Value = list.ToArray();
    }
}