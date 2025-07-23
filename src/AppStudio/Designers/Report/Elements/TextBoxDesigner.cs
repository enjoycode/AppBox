using System.Text;
using AppBox.Reporting.Drawing;
using AppBox.Reporting.Processing;
using AppBoxDesign.Diagram.PropertyEditors;
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
    }

    private bool NoWrap => !ReportItem.Multiline || !ReportItem.TextWrap;
    private readonly string _emptyMessage = string.Empty;
    private const char ReplacementChar = '\uFFFD';

    protected override void SetBounds(float x, float y, float width, float height, BoundsSpecified specified)
    {
        var unitType = ReportItem.Bounds.Top.Type;

        if (specified == BoundsSpecified.Location)
        {
            ReportItem.Location = new RPoint(ReportSize.FromPixels(x, unitType), ReportSize.FromPixels(y, unitType));
        }
        else if (specified == BoundsSpecified.Size)
        {
            ReportItem.Size = new RSize(ReportSize.FromPixels(width, unitType),
                ReportSize.FromPixels(height, unitType));
        }
        else
        {
            var bounds = new RRectangle(ReportSize.FromPixels(x, unitType), ReportSize.FromPixels(y, unitType)
                , ReportSize.FromPixels(width, unitType), ReportSize.FromPixels(height, unitType));
            ReportItem.Bounds = bounds;
        }

        Invalidate();
    }

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
                new ReportDiagramProperty(this, nameof(TextBox.Value), nameof(ReportTextEditor))
                {
                    ValueGetter = () => ReportItem.Value,
                    ValueSetter = v => ReportItem.Value = v as string ?? string.Empty,
                },
                new ReportDiagramProperty(this, nameof(TextBox.CanGrow), nameof(CheckBoxEditor))
                {
                    ValueGetter = () => ReportItem.CanGrow,
                    ValueSetter = v => ReportItem.CanGrow = v is true,
                },
                new ReportDiagramProperty(this, nameof(TextBox.CanShrink), nameof(CheckBoxEditor))
                {
                    ValueGetter = () => ReportItem.CanShrink,
                    ValueSetter = v => ReportItem.CanShrink = v is true,
                }
            ]
        };

        if (!IsTableCell)
            yield return GetLayoutPropertyGroup();

        yield return GetStylePropertyGroup();
    }
}