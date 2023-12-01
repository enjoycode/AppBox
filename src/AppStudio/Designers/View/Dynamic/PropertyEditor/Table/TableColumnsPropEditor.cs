using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class TableColumnsPropEditor : ValueEditorBase
{
    public TableColumnsPropEditor(State<TableColumnSettings[]> state, DesignElement element) : base(element)
    {
        _state = state;
        Child = new Button("...") { Width = float.MaxValue, OnTap = OnTap };
    }
    
    private readonly State<TableColumnSettings[]> _state;

    private void OnTap(PointerEvent _)
    {
        //先判断有没有设置DataSet
        Element.Data.TryGetPropertyValue(nameof(DynamicCartesianChart.DataSet), out var datasetValue);
        if (datasetValue?.Value.Value is not string dsName || string.IsNullOrEmpty(dsName))
        {
            Notification.Warn("尚未设置DataSet");
            return;
        }
    }
}