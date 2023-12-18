using System;
using System.Text.Json.Serialization;
using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

public sealed class TextColumnSettings : TableColumnSettings, ITableFieldColumn
{
    [JsonIgnore] public override string Type => Text;

    private string _field = string.Empty;
    private bool _autoMergeCells;

    public string Field
    {
        get => _field;
        set => SetField(ref _field, value);
    }

    public bool AutoMergeCells
    {
        get => _autoMergeCells;
        set => SetField(ref _autoMergeCells, value);
    }

    protected internal override DataGridColumn<DynamicEntity> BuildColumn()
    {
        var cellStyle = new CellStyle
        {
            HorizontalAlignment = HorizontalAlignment,
            VerticalAlignment = VerticalAlignment
        };

        return new DataGridTextColumn<DynamicEntity>(Label,
            t => t.HasValue(Field) ? t[Field].ToStringValue() : string.Empty)
        {
            Width = Width,
            AutoMergeCells = AutoMergeCells,
            CellStyle = cellStyle,
        };
    }

    public override TableColumnSettings Clone() => new TextColumnSettings
    {
        Label = Label, Width = Width, Field = Field,
        HorizontalAlignment = HorizontalAlignment,
        VerticalAlignment = VerticalAlignment,
        AutoMergeCells = AutoMergeCells,
    };
}