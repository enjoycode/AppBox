using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

public sealed class TableStyles : IBinSerializable
{
    public Color? HeaderTextColor { get; set; } = DataGridTheme.Default.DefaultHeaderCellStyle.TextColor;

    public Color? HeaderFillColor { get; set; } = DataGridTheme.Default.DefaultHeaderCellStyle.FillColor;

    public Color? RowTextColor { get; set; } = DataGridTheme.Default.DefaultRowCellStyle.TextColor;

    public Color? RowFillColor { get; set; } = DataGridTheme.Default.DefaultRowCellStyle.FillColor;

    public Color? BorderColor { get; set; } = DataGridTheme.Default.BorderColor;

    public bool StripRows { get; set; } = DataGridTheme.Default.StripeRows;

    public Color? StripFillColor { get; set; } = DataGridTheme.Default.StripeFillColor;

    public TableStyles Clone() => new()
    {
        HeaderTextColor = HeaderTextColor,
        HeaderFillColor = HeaderFillColor,
        RowTextColor = RowTextColor,
        RowFillColor = RowFillColor,
        BorderColor = BorderColor,
        StripRows = StripRows,
        StripFillColor = StripFillColor,
    };

    internal DataGridTheme ToRuntimeStyles()
    {
        var theme = new DataGridTheme();
        if (HeaderTextColor.HasValue)
            theme.DefaultHeaderCellStyle.TextColor = HeaderTextColor.Value;
        if (HeaderFillColor.HasValue)
            theme.DefaultHeaderCellStyle.FillColor = HeaderFillColor.Value;
        if (RowTextColor.HasValue)
            theme.DefaultRowCellStyle.TextColor = RowTextColor.Value;
        if (RowFillColor.HasValue)
            theme.DefaultRowCellStyle.FillColor = RowFillColor;
        if (BorderColor.HasValue)
            theme.BorderColor = BorderColor.Value;

        theme.StripeRows = StripRows;
        if (StripFillColor.HasValue)
            theme.StripeFillColor = StripFillColor.Value;

        return theme;
    }

    #region ====Serialization

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        if (HeaderTextColor.HasValue && HeaderTextColor.Value != DataGridTheme.Default.DefaultHeaderCellStyle.TextColor)
        {
            ws.WriteFieldId(1);
            ws.WriteUInt((uint)HeaderTextColor.Value);
        }

        if (HeaderFillColor.HasValue && HeaderFillColor.Value != DataGridTheme.Default.DefaultHeaderCellStyle.FillColor)
        {
            ws.WriteFieldId(2);
            ws.WriteUInt((uint)HeaderFillColor.Value);
        }

        if (RowTextColor.HasValue && RowTextColor.Value != DataGridTheme.Default.DefaultRowCellStyle.TextColor)
        {
            ws.WriteFieldId(3);
            ws.WriteUInt((uint)RowTextColor.Value);
        }

        if (RowFillColor.HasValue && RowFillColor.Value != DataGridTheme.Default.DefaultRowCellStyle.FillColor)
        {
            ws.WriteFieldId(4);
            ws.WriteUInt((uint)RowFillColor.Value);
        }

        if (BorderColor.HasValue && BorderColor.Value != DataGridTheme.Default.BorderColor)
        {
            ws.WriteFieldId(5);
            ws.WriteUInt((uint)BorderColor.Value);
        }

        if (StripRows != DataGridTheme.Default.StripeRows)
        {
            ws.WriteFieldId(6);
            ws.WriteBool(StripRows);
        }

        if (StripFillColor.HasValue && StripFillColor.Value != DataGridTheme.Default.StripeFillColor)
        {
            ws.WriteFieldId(7);
            ws.WriteUInt((uint)StripFillColor.Value);
        }

        ws.WriteFieldEnd();
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        while (true)
        {
            var fieldId = rs.ReadFieldId();
            switch (fieldId)
            {
                case 1: HeaderTextColor = new(rs.ReadUInt()); break;
                case 2: HeaderFillColor = new(rs.ReadUInt()); break;
                case 3: RowTextColor = new(rs.ReadUInt()); break;
                case 4: RowFillColor = new(rs.ReadUInt()); break;
                case 5: BorderColor = new(rs.ReadUInt()); break;
                case 6: StripRows = rs.ReadBool(); break;
                case 7: StripFillColor = new(rs.ReadUInt()); break;
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(TableStyles), fieldId);
            }
        }
    }

    #endregion
}