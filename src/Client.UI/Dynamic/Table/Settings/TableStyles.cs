using PixUI;

namespace AppBoxClient.Dynamic;

public sealed class TableStyles
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
}