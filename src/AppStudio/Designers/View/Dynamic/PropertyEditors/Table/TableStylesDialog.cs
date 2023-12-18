using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditors;

internal sealed class TableStylesDialog : Dialog
{
    public TableStylesDialog(TableStyles styles, DesignElement element)
    {
        Title.Value = "Table Styles";
        Width = 350;
        Height = 450;
        _styles = styles;
    }

    private readonly TableStyles _styles;
    private readonly DesignElement _element;

    protected override Widget BuildBody()
    {
        var headerTextColor = new RxProxy<Color?>(() => _styles.HeaderTextColor, v => _styles.HeaderTextColor = v);
        var headerFillColor = new RxProxy<Color?>(() => _styles.HeaderFillColor, v => _styles.HeaderFillColor = v);
        var rowTextColor = new RxProxy<Color?>(() => _styles.RowTextColor, v => _styles.RowTextColor = v);
        var rowFillColor = new RxProxy<Color?>(() => _styles.RowFillColor, v => _styles.RowFillColor = v);
        var borderColor = new RxProxy<Color?>(() => _styles.BorderColor, v => _styles.BorderColor = v);
        var stripRows = new RxProxy<bool>(() => _styles.StripRows, v => _styles.StripRows = v);
        var stripFillColor = new RxProxy<Color?>(() => _styles.StripFillColor, v => _styles.StripFillColor = v);

        return new Container
        {
            Padding = EdgeInsets.All(20),
            Child = new Form
            {
                Children =
                {
                    new("HeaderTextColor:", new ColorEditor(headerTextColor, _element)),
                    new("HeaderFillColor:", new ColorEditor(headerFillColor, _element)),
                    new("RowTextColor:", new ColorEditor(rowTextColor, _element)),
                    new("RowFillColor:", new ColorEditor(rowFillColor, _element)),
                    new("BorderColor:", new ColorEditor(borderColor, _element)),
                    new("StripRows:", new Switch(stripRows)),
                    new("StripFillColor:", new ColorEditor(stripFillColor, _element)),
                }
            }
        };
    }
}