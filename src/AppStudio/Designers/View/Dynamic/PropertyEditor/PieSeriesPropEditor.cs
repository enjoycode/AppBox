using System.Linq;
using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class PieSeriesPropEditor : ValueEditorBase
{
    public PieSeriesPropEditor(State<PieSeriesSettings?> state, DesignElement element) : base(element)
    {
        _state = state;
        Child = new Button("...") { Width = float.MaxValue, OnTap = OnTap };
    }

    private readonly State<PieSeriesSettings?> _state;

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
        var newOrCloned = _state.Value ?? new PieSeriesSettings();

        var dlg = new PieSeriesDialog(newOrCloned, Element);
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK) return;

        _state.Value = newOrCloned;
    }
}