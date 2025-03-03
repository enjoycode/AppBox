using System.Linq;
using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditors;

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
        //先判断有没有设置DataSource
        Element.Data.TryGetPropertyValue(nameof(DynamicCartesianChart.DataSource), out var dataSourceValue);
        if (dataSourceValue?.Value.Value is not string dsName || string.IsNullOrEmpty(dsName))
        {
            Notification.Warn("尚未设置DataSource");
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