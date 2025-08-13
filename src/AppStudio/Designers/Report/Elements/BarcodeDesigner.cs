using AppBox.Reporting.Drawing;
using AppBox.Reporting.Processing.Common;
using AppBox.Reporting.Processing.Primitives;
using PixUI;
using Processing = AppBox.Reporting.Processing;
using Barcode = AppBox.Reporting.Barcode;
using Colors = AppBox.Reporting.Drawing.Colors;

namespace AppBoxDesign;

internal sealed class BarcodeDesigner : ReportItemDesigner<Barcode>
{
    internal BarcodeDesigner() : this(new Barcode()) { }

    public BarcodeDesigner(Barcode barcode)
    {
        ReportItem = barcode;
    }

    protected override void OnAddToSurface()
    {
        base.OnAddToSurface();

        ReportItem.Value = "123456789";
    }

    public override void Paint(Canvas canvas)
    {
        base.Paint(canvas);

        using var graphics = new Graphics(canvas);
        var value = ReportItem.Value;

        if (string.IsNullOrEmpty(value))
        {
            value = "<BarCode>";
            DrawString(graphics, value);
        }
        else if (value.StartsWith('='))
        {
            value = $"[{value}]";
            DrawString(graphics, value);
        }
        else
        {
            try
            {
                DrawBarcode(graphics);
            }
            catch (Exception e)
            {
                DrawError(graphics, e);
            }
        }
    }

    private void DrawBarcode(Graphics graphics)
    {
        graphics.Save();

        try
        {
            var processingBarcode = new Processing.Barcode();
            processingBarcode.Initialize(ReportItem);
            processingBarcode.ProcessingContext = new Processing.ProcessingContext();
            processingBarcode.Process(null);

            if (processingBarcode.HasError)
                throw processingBarcode.Exception;

            using var measureContext = new Processing.MeasureContext();
            measureContext.PageUnit = GraphicsUnit.Pixel;
            var layoutRect = new RectangleRF(0, 0, Bounds.Width, Bounds.Height);
            processingBarcode.Arrange(measureContext, layoutRect);
            
            graphics.TranslateTransform(Bounds.X, Bounds.Y);
            new PrimitiveElementGdiWriter(graphics).Write(processingBarcode.ElementContainer);
        }
        finally
        {
            graphics.Restore();
        }
    }

    private void DrawString(Graphics graphics, string text)
    {
        using var format = new StringFormat();
        format.Alignment = Processing.BarcodeHelper.GetAlignment(ReportItem.Style.TextAlign);
        format.LineAlignment = Processing.BarcodeHelper.GetAlignment(ReportItem.Style.VerticalAlign);
        using var font = ReportItem.Style.Font.ToDrawingFont();
        graphics.DrawString(text, font, ReportItem.Style.Color, Bounds, format);
    }

    private void DrawError(Graphics graphics, Exception error)
    {
        using var format = new StringFormat();
        format.Alignment = StringAlignment.Center;
        format.LineAlignment = StringAlignment.Center;
        var message = $"#ERROR# {error.Message}";
        using var font = ReportItem.Style.Font.ToDrawingFont();
        graphics.DrawString(message, font, Colors.Red, Bounds, format);
    }
}