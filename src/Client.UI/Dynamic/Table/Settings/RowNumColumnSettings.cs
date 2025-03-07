using System.Text.Json.Serialization;
using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

public sealed class RowNumColumnSettings : TableColumnSettings
{
    [JsonIgnore] public override string Type => RowNum;

    protected internal override DataGridColumn<DynamicRow> BuildColumn(DataGridController<DynamicRow> controller)
    {
        var cellStyle = new CellStyle
            { HorizontalAlignment = HorizontalAlignment, VerticalAlignment = VerticalAlignment };
        return new DataGridRowNumColumn<DynamicRow>(Label) { Width = Width, CellStyle = cellStyle };
    }
    
    public override TableColumnSettings Clone() =>
        new RowNumColumnSettings
        {
            Label = Label, Width = Width,
            HorizontalAlignment = HorizontalAlignment,
            VerticalAlignment = VerticalAlignment
        };
}