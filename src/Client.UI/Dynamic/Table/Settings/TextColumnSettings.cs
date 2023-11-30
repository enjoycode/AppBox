using System;
using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

public sealed class TextColumnSettings : ColumnSettings
{
    public string Field { get; set; } = string.Empty;

    protected internal override DataGridColumn<DynamicEntity> BuildColumn()
    {
        return new DataGridTextColumn<DynamicEntity>(Label,
            t => t.HasValue(Field) ? t[Field].ToStringValue() : string.Empty);
    }
}