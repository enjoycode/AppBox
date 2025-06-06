using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditors;

// ReSharper disable once ClassNeverInstantiated.Global
internal sealed class TableColumnsPropEditor : ValueEditorBase
{
    public TableColumnsPropEditor(State<TableColumnSettings[]> state, DesignElement element) : base(element)
    {
        _state = state;
        Child = new Button("...") { Width = float.MaxValue, OnTap = OnTap };
    }

    private readonly State<TableColumnSettings[]> _state;

    private async void OnTap(PointerEvent _)
    {
        //先判断有没有设置DataSource
        Element.Data.TryGetPropertyValue(nameof(DynamicCartesianChart.DataSource), out var dataSourceValue);
        if (dataSourceValue?.Value.Value is not string dsName || string.IsNullOrEmpty(dsName))
        {
            Notification.Warn("尚未设置DataSource");
            return;
        }

        //编辑副本
        var list = new List<TableColumnSettings>();
        if (_state.Value is { Length: > 0 })
            list.AddRange(_state.Value.Select(t => t.Clone()));

        var dlg = new TableColumnsDialog(list, Element);
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK) return;

        _state.Value = list.ToArray();
    }
}