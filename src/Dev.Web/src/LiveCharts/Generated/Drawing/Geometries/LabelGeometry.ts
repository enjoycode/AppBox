import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as LiveCharts from '@/LiveCharts'

export class LabelGeometry extends LiveCharts.Geometry implements LiveChartsCore.ILabelGeometry<LiveCharts.SkiaDrawingContext> {
    private static readonly $meta_LiveChartsCore_ILabelGeometry = true;
    private readonly _textSizeProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _backgroundProperty: LiveChartsCore.ColorMotionProperty;

    public constructor() {
        super(true);
        this._textSizeProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("TextSize", 11));
        this._backgroundProperty = this.RegisterMotionProperty(new LiveChartsCore.ColorMotionProperty("Background", (LiveChartsCore.LvcColor.Empty).Clone()));
        this.TransformOrigin = new LiveChartsCore.LvcPoint(0, 0);
    }

    public VerticalAlign: LiveChartsCore.Align = LiveChartsCore.Align.Middle;

    public HorizontalAlign: LiveChartsCore.Align = LiveChartsCore.Align.Middle;

    public Text: string = '';

    public get TextSize(): number {
        return this._textSizeProperty.GetMovement(this);
    }

    public set TextSize(value: number) {
        this._textSizeProperty.SetMovement(value, this);
    }

    public get Background(): LiveChartsCore.LvcColor {
        return this._backgroundProperty.GetMovement(this);
    }

    public set Background(value: LiveChartsCore.LvcColor) {
        this._backgroundProperty.SetMovement((value).Clone(), this);
    }

    public Padding: LiveChartsCore.Padding = new LiveChartsCore.Padding(0, 0, 0, 0);

    public LineHeight: number = 1.75;

    OnDraw(context: LiveCharts.SkiaDrawingContext, paint: PixUI.Paint) {
        let size = this.OnMeasure(context.PaintTask);

        let bg = (this.Background).Clone();
        if (System.OpInequality(bg, LiveChartsCore.LvcColor.Empty)) {
            let bgPaint = new CanvasKit.Paint();
            let p = this.Padding;
            context.Canvas.drawRect(PixUI.Rect.FromLTWH(this.X - p.Left, this.Y - size.Height + p.Bottom, size.Width, size.Height), bgPaint);
            bgPaint.delete();
        }

        let lines = this.GetLines(this.Text);
        let linesCount: number = lines.length;
        let lineNumber = 0;
        let lhd = (this.GetActualLineHeight(paint) - this.GetRawLineHeight(paint)) * 0.5;

        for (const line of lines) {
            let ph = <number><unknown>(++lineNumber / linesCount) * size.Height;
            let yLine = ph - size.Height;
            this.DrawLine(line, yLine - lhd, context, paint);
        }
    }

    OnMeasure(drawable: LiveCharts.Paint): LiveChartsCore.LvcSize {
        //var typeface = drawable.GetSKTypeface();

        let p = new CanvasKit.Paint();

        let bounds = this.MeasureLines(p);
        p.delete();

        // Note #301222
        // Disposing typefaces could cause render issues.
        // Does this causes memory leaks?
        // Should the user dispose typefaces manually?
        //typeface.Dispose();

        return new LiveChartsCore.LvcSize(bounds.Width + this.Padding.Left + this.Padding.Right, bounds.Height + this.Padding.Top + this.Padding.Bottom);
    }

    ApplyCustomGeometryTransform(context: LiveCharts.SkiaDrawingContext) {
        //context.Paint.TextSize = TextSize;
        let size = this.MeasureLines(context.Paint);
        let toRadians: number = Math.PI / 180;
        let p = this.Padding;
        let w: number = 0.5;
        let h: number = 0.5;

        switch (this.VerticalAlign) {
            case LiveChartsCore.Align.Start:
                h = 1 * size.Height + p.Top;
                break;
            case LiveChartsCore.Align.Middle:
                h = 0.5 * (size.Height + p.Top - p.Bottom);
                break;
            case LiveChartsCore.Align.End:
                h = 0 * size.Height - p.Bottom;
                break;
            default:
                break;
        }

        switch (this.HorizontalAlign) {
            case LiveChartsCore.Align.Start:
                w = 0 * size.Width - p.Left;
                break;
            case LiveChartsCore.Align.Middle:
                w = 0.5 * (size.Width - p.Left + p.Right);
                break;
            case LiveChartsCore.Align.End:
                w = 1 * size.Width + p.Right;
                break;
            default:
                break;
        }

        let rotation = this.RotateTransform;
        rotation = <number><unknown>(rotation * toRadians);

        let xp = -Math.cos(rotation) * w + -Math.sin(rotation) * h;
        let yp = -Math.sin(rotation) * w + Math.cos(rotation) * h;

        // translate the label to the upper-left corner
        // just for consistency with the rest of the shapes in the library (and Skia??),
        // and also translate according to the vertical an horizontal alignment properties
        context.Canvas.translate(<number><unknown>xp, <number><unknown>yp);
    }

    private DrawLine(content: string, yLine: number, context: LiveCharts.SkiaDrawingContext, paint: PixUI.Paint) {
        // if (paint.Typeface is not null)
        // {
        //     using var eventTextShaper = new SKShaper(paint.Typeface);
        //     context.Canvas.DrawShapedText(content, new SKPoint(X, Y + yLine), paint);
        //     return;
        // }
        //
        // context.Canvas.DrawText(content, new SKPoint(X, Y + yLine), paint);

        //TODO: 暂简单实现
        let para = PixUI.TextPainter.BuildParagraph(content, Number.POSITIVE_INFINITY, this.TextSize, paint.getColor());
        context.Canvas.drawParagraph(para, this.X, this.Y + yLine - this.TextSize);
        para.delete();
    }

    private MeasureLines(paint: PixUI.Paint): LiveChartsCore.LvcSize {
        let w: number = 0;
        let h: number = 0;
        //var lineHeight = GetActualLineHeight(paint);

        for (const line of this.GetLines(this.Text)) {
            //var bounds = new SKRect();
            //_ = paint.MeasureText(line, ref bounds);
            //if (bounds.Width > w) w = bounds.Width;
            //h += lineHeight;

            //TODO: 暂简单实现
            let para = PixUI.TextPainter.BuildParagraph(line, Number.POSITIVE_INFINITY, this.TextSize, paint.getColor(), null, 1, true);
            h += para.getHeight() * this.LineHeight;
            if (para.getLongestLine() > w) w = para.getLongestLine();
            para.delete();
        }

        return new LiveChartsCore.LvcSize(w, h);
    }

    private GetActualLineHeight(paint: PixUI.Paint): number {
        // var boundsH = new SKRect();
        // _ = paint.MeasureText("█", ref boundsH);
        // return LineHeight * boundsH.Height;
        //TODO: 暂简单实现
        return this.TextSize * this.LineHeight;
    }

    private GetRawLineHeight(paint: PixUI.Paint): number {
        // var boundsH = new SKRect();
        // _ = paint.MeasureText("█", ref boundsH);
        // return boundsH.Height;
        //TODO: 暂简单实现
        return this.TextSize;
    }

    private GetLines(multiLineText: string): string[] {
        return System.IsNullOrEmpty(multiLineText)
            ? [] : multiLineText.split(String.fromCharCode(10));
    }
}