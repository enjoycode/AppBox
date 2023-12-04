using System.Text.Json.Serialization;
using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

public sealed class RowNumColumnSettings : TableColumnSettings
{
    [JsonIgnore] public override string Type => RowNum;

    protected internal override DataGridColumn<DynamicEntity> BuildColumn() =>
        new DataGridRowNumColumn<DynamicEntity>(Label);


    public override TableColumnSettings Clone() =>
        new RowNumColumnSettings { Label = Label };
}