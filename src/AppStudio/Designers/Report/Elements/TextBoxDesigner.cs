using System.Text;
using AppBox.Reporting.Drawing;
using AppBox.Reporting.Processing;
using PixUI;
using PixUI.Diagram;
using TextBox = AppBox.Reporting.TextBox;

namespace AppBoxDesign;

internal sealed class TextBoxDesigner : ReportItemDesigner<TextBox>
{
    internal TextBoxDesigner() : this(new TextBox()) { }

    public TextBoxDesigner(TextBox textbox)
    {
        ReportItem = textbox;
        // ReportItem.PropertyChange += OnPropertyChanged;
    }

    private bool NoWrap => !ReportItem.Multiline || !ReportItem.TextWrap;
    private readonly string _emptyMessage = string.Empty;
    private const char ReplacementChar = '\uFFFD';

    protected override void SetBounds(float x, float y, float width, float height, BoundsSpecified specified)
    {
        var unitType = ReportItem.Bounds.Top.Type;
        var bounds = new RRectangle(ReportSize.FromPixels(x, unitType), ReportSize.FromPixels(y, unitType)
            , ReportSize.FromPixels(width, unitType), ReportSize.FromPixels(height, unitType));
        ReportItem.Bounds = bounds;

        Invalidate();
    }

    // private void OnPropertyChanged(object sender, PropertyChangeEventArgs e)
    // {
    //     //Invalidate(); //暂全部重画
    // }

    public override void Paint(Canvas canvas)
    {
        base.Paint(canvas);

        var clientRect = Bounds;
        Brush? brush = null;

        using var textFormat = CreateTextFormat();
        var text = ReportItem.Value;
        if (string.IsNullOrEmpty(text))
        {
            if (!string.IsNullOrEmpty(_emptyMessage))
            {
                text = _emptyMessage;
                brush = new SolidBrush(ReportDesignSettings.SelectionColor);
                textFormat.VerticalAlign = VerticalAlign.Middle;
                textFormat.HorizontalAlign = HorizontalAlign.Center;
            }

            if (!IsTableCell)
            {
                text = "<TextBox>";
                textFormat.Trimming = StringTrimming.Character;
            }

            TextUtils.SetStringFormatFlags(textFormat, false, StringFormatFlags.NoWrap);
        }
        else if (text.StartsWith('='))
        {
            text = $"[{text}]";
            textFormat.FormatFlags &= ~StringFormatFlags.DirectionRightToLeft;
            textFormat.Trimming = StringTrimming.Character;
            TextUtils.SetStringFormatFlags(textFormat, false, StringFormatFlags.NoWrap);
        }
        else if (!ReportItem.Multiline)
        {
            var sb = new StringBuilder(text);
            sb.Replace(Environment.NewLine, "" + ReplacementChar);
            sb.Replace('\n', ReplacementChar);
            sb.Replace('\r', ReplacementChar);
            text = sb.ToString();
        }

        brush ??= new SolidBrush(ReportItem.Style.Color);

        using var graphics = new Graphics(canvas);
        using (brush)
        {
            AppBox.Reporting.Processing.TextRenderer.DrawText(graphics,
                text, ReportItem.Style.Font, brush, clientRect, ReportItem.Angle, textFormat);
        }
    }

    private TextFormat CreateTextFormat()
    {
        var textFormat = TextUtils.CreateDefaultTextFormat();

        textFormat.HorizontalAlign = ReportItem.Style.TextAlign;
        textFormat.VerticalAlign = ReportItem.Style.VerticalAlign;

        //TextUtils.SetStringFormatFlags(textFormat, ReportItem.DirectionRightToLeft, StringFormatFlags.DirectionRightToLeft);
        TextUtils.SetStringFormatFlags(textFormat, false, StringFormatFlags.DirectionRightToLeft);
        TextUtils.SetStringFormatFlags(textFormat, NoWrap, StringFormatFlags.NoWrap);

        textFormat.Trimming = NoWrap ? StringTrimming.Character : StringTrimming.Word;

        return textFormat;
    }

    public override IEnumerable<DiagramPropertyGroup> GetProperties()
    {
        yield return new DiagramPropertyGroup()
        {
            GroupName = "Properties",
            Properties =
            [
                new DiagramPropertyItem()
                {
                    PropertyName = "Value", EditorName = "ReportText",
                    ValueGetter = () => ReportItem.Value,
                    ValueSetter = v =>
                    {
                        ReportItem.Value = v as string ?? string.Empty;
                        Invalidate();
                    },
                }
            ]
        };
    }
}