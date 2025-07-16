using System.Text;
using AppBox.Reporting;
using AppBox.Reporting.Drawing;
using AppBox.Reporting.Processing;
using PixUI;
using PixUI.Diagram;
using ReportItem = AppBox.Reporting.ReportItem;
using ReportItemBase = AppBox.Reporting.ReportItemBase;
using TextBox = AppBox.Reporting.TextBox;

namespace AppBoxDesign;

internal sealed class TextBoxDesigner : ReportItemDesigner, IReportItemDesigner
{
    internal TextBoxDesigner() : this(new TextBox()) { }

    public TextBoxDesigner(TextBox textbox)
    {
        TextBox = textbox;
        TextBox.PropertyChange += OnPropertyChanged;
    }

    internal TextBox TextBox { get; }

    private bool NoWrap => !TextBox.Multiline || !TextBox.TextWrap;
    private readonly string _emptyMessage = string.Empty;
    private const char ReplacementChar = '\uFFFD';

    internal override ReportItem ReportItem => TextBox;

    ReportItemBase IReportItemDesigner.ReportItem => ReportItem;

    protected override void SetBounds(float x, float y, float width, float height, BoundsSpecified specified)
    {
        var unitType = TextBox.Bounds.Top.Type;
        var bounds = new RRectangle(ReportSize.FromPixels(x, unitType), ReportSize.FromPixels(y, unitType)
            , ReportSize.FromPixels(width, unitType), ReportSize.FromPixels(height, unitType));
        TextBox.Bounds = bounds;

        Invalidate();
    }

    private void OnPropertyChanged(object sender, PropertyChangeEventArgs e)
    {
        //暂全部重画
        Invalidate();
    }

    public override void Paint(Canvas canvas)
    {
        base.Paint(canvas);

        var clientRect = Bounds;
        Brush? brush = null;

        using var textFormat = CreateTextFormat();
        var text = TextBox.Value;
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
        else if (!TextBox.Multiline)
        {
            var sb = new StringBuilder(text);
            sb.Replace(Environment.NewLine, "" + ReplacementChar);
            sb.Replace('\n', ReplacementChar);
            sb.Replace('\r', ReplacementChar);
            text = sb.ToString();
        }

        if (null == brush)
            brush = new SolidBrush(TextBox.Style.Color);

        using var graphics = new Graphics(canvas);
        using (brush)
        {
            AppBox.Reporting.Processing.TextRenderer.DrawText(graphics,
                text, TextBox.Style.Font, brush, clientRect, TextBox.Angle, textFormat);
        }
    }

    private TextFormat CreateTextFormat()
    {
        var textFormat = TextUtils.CreateDefaultTextFormat();

        textFormat.HorizontalAlign = TextBox.Style.TextAlign;
        textFormat.VerticalAlign = TextBox.Style.VerticalAlign;

        //TextUtils.SetStringFormatFlags(textFormat, TextBox.DirectionRightToLeft, StringFormatFlags.DirectionRightToLeft);
        TextUtils.SetStringFormatFlags(textFormat, false, StringFormatFlags.DirectionRightToLeft);
        TextUtils.SetStringFormatFlags(textFormat, NoWrap, StringFormatFlags.NoWrap);

        textFormat.Trimming = NoWrap ? StringTrimming.Character : StringTrimming.Word;

        return textFormat;
    }
}