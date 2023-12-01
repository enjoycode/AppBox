using System;
using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

public sealed class TextColumnSettings : TableColumnSettings
{
    public override string Type => "Text";

    private string _field = string.Empty;

    public string Field
    {
        get => _field;
        set => SetField(ref _field, value);
    }

    protected internal override DataGridColumn<DynamicEntity> BuildColumn()
    {
        return new DataGridTextColumn<DynamicEntity>(Label,
            t => t.HasValue(Field) ? t[Field].ToStringValue() : string.Empty);
    }

    public override TableColumnSettings Clone() =>
        new TextColumnSettings { Label = Label, Field = Field };
}