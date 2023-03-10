import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as PixUI from '@/PixUI'
import * as LiveCharts from '@/LiveCharts'

export class LinearGradientPaint extends LiveCharts.Paint {
    protected static readonly s_defaultStartPoint: PixUI.Point = (new PixUI.Point(0, 0.5)).Clone();

    protected static readonly s_defaultEndPoint: PixUI.Point = (new PixUI.Point(1, 0.5)).Clone();

    private readonly _gradientStops: PixUI.Color[];
    private readonly _startPoint: PixUI.Point;
    private readonly _endPoint: PixUI.Point;
    private readonly _colorPos: Nullable<Float32Array>;
    private readonly _tileMode: PixUI.TileMode;
    private _drawingContext: Nullable<LiveCharts.SkiaDrawingContext>;

    public constructor(
        gradientStops: PixUI.Color[],
        startPoint: PixUI.Point,
        endPoint: PixUI.Point,
        colorPos: Nullable<Float32Array> = null,
        tileMode: PixUI.TileMode = CanvasKit.TileMode.Repeat) {
        super();
        this._gradientStops = gradientStops;
        this._startPoint = (startPoint).Clone();
        this._endPoint = (endPoint).Clone();
        this._colorPos = colorPos;
        this._tileMode = tileMode;
    }

    // /// <summary>
    // /// Initializes a new instance of the <see cref="LinearGradientPaint"/> class.
    // /// </summary>
    // /// <param name="gradientStops">The gradient stops.</param>
    // public LinearGradientPaint(SKColor[] gradientStops)
    //     : this(gradientStops, s_defaultStartPoint, s_defaultEndPoint) { }

    // /// <summary>
    // /// Initializes a new instance of the <see cref="LinearGradientPaint"/> class.
    // /// </summary>
    // /// <param name="startColor">The start color.</param>
    // /// <param name="endColor">The end color.</param>
    // /// <param name="startPoint">
    // /// The start point, both X and Y in the range of 0 to 1, where 0 is the start of the axis and 1 the end.
    // /// </param>
    // /// <param name="endPoint">
    // /// The end point, both X and Y in the range of 0 to 1, where 0 is the start of the axis and 1 the end.
    // /// </param>
    // public LinearGradientPaint(SKColor startColor, SKColor endColor, SKPoint startPoint, SKPoint endPoint)
    //     : this(new[] { startColor, endColor }, startPoint, endPoint) { }

    // /// <summary>
    // /// Initializes a new instance of the <see cref="LinearGradientPaint"/> class.
    // /// </summary>
    // /// <param name="start">The start.</param>
    // /// <param name="end">The end.</param>
    // public LinearGradientPaint(SKColor start, SKColor end)
    //     : this(start, end, s_defaultStartPoint, s_defaultEndPoint) { }

    CloneTask(): LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext> {
        return new LinearGradientPaint(this._gradientStops, (this._startPoint).Clone(), (this._endPoint).Clone(), this._colorPos, this._tileMode).Init(
            {
                Style: this.Style,
                IsStroke: this.IsStroke,
                IsFill: this.IsFill,
                Color: this.Color,
                IsAntialias: this.IsAntialias,
                StrokeThickness: this.StrokeThickness,
                StrokeCap: this.StrokeCap,
                StrokeJoin: this.StrokeJoin,
                StrokeMiter: this.StrokeMiter,
                FontFamily: this.FontFamily,
                SKFontStyle: this.SKFontStyle,
                SKTypeface: this.SKTypeface,
                PathEffect: this.PathEffect?.Clone(),
                ImageFilter: this.ImageFilter?.Clone()
            });
    }

    ApplyOpacityMask(context: LiveCharts.SkiaDrawingContext, geometry: LiveChartsCore.IPaintable<LiveCharts.SkiaDrawingContext>) {
        throw new System.NotImplementedException();
    }

    RestoreOpacityMask(context: LiveCharts.SkiaDrawingContext, geometry: LiveChartsCore.IPaintable<LiveCharts.SkiaDrawingContext>) {
        throw new System.NotImplementedException();
    }

    InitializeTask(drawingContext: LiveCharts.SkiaDrawingContext) {
        this._skiaPaint ??= new CanvasKit.Paint();

        let size = this.GetDrawRectangleSize(drawingContext);

        let xf = size.Left;
        let xt = xf + size.Width;

        let yf = size.Top;
        let yt = yf + size.Height;

        let start = new PixUI.Point(xf + (xt - xf) * this._startPoint.X, yf + (yt - yf) * this._startPoint.Y);
        let end = new PixUI.Point(xf + (xt - xf) * this._endPoint.X, yf + (yt - yf) * this._endPoint.Y);

        this._skiaPaint.setShader(CanvasKit.Shader.MakeLinearGradient((start).Clone(), (end).Clone(), this._gradientStops, this._colorPos == null ? null : Array.from(this._colorPos), this._tileMode));
        this._skiaPaint.setAntiAlias(this.IsAntialias);
        this._skiaPaint.setStyle(CanvasKit.PaintStyle.Stroke);
        this._skiaPaint.setStrokeWidth(this.StrokeThickness);
        this._skiaPaint.setStrokeCap(this.StrokeCap);
        this._skiaPaint.setStrokeJoin(this.StrokeJoin);
        this._skiaPaint.setStrokeMiter(this.StrokeMiter);
        this._skiaPaint.setStyle(this.IsStroke ? CanvasKit.PaintStyle.Stroke : CanvasKit.PaintStyle.Fill);

        //if (HasCustomFont) _skiaPaint.Typeface = GetSKTypeface();

        if (this.PathEffect != null) {
            this.PathEffect.CreateEffect(drawingContext);
            this._skiaPaint.setPathEffect(this.PathEffect.SKPathEffect);
        }

        if (this.ImageFilter != null) {
            this.ImageFilter.CreateFilter(drawingContext);
            this._skiaPaint.setImageFilter(this.ImageFilter.SKImageFilter);
        }

        let clip = this.GetClipRectangle(drawingContext.MotionCanvas);
        if (System.OpInequality(clip, LiveChartsCore.LvcRectangle.Empty)) {
            drawingContext.Canvas.save();
            drawingContext.Canvas.clipRect(PixUI.Rect.FromLTWH(clip.X, clip.Y, clip.Width, clip.Height), CanvasKit.ClipOp.Intersect, true);
            this._drawingContext = drawingContext;
        }

        drawingContext.Paint = this._skiaPaint;
        drawingContext.PaintTask = this;
    }

    Dispose() {
        // Note #301222
        // Disposing typefaces could cause render issues.
        // Does this causes memory leaks?
        // Should the user dispose typefaces manually?
        //if (HasCustomFont && _skiaPaint != null) _skiaPaint.Typeface.Dispose();
        this.PathEffect?.Dispose();
        this.ImageFilter?.Dispose();

        if (this._drawingContext != null && System.OpInequality(this.GetClipRectangle(this._drawingContext.MotionCanvas), LiveChartsCore.LvcRectangle.Empty)) {
            this._drawingContext.Canvas.restore();
            this._drawingContext = null;
        }

        super.Dispose();
    }

    private GetDrawRectangleSize(drawingContext: LiveCharts.SkiaDrawingContext): PixUI.Rect {
        let clip = this.GetClipRectangle(drawingContext.MotionCanvas);

        return System.OpEquality(clip, LiveChartsCore.LvcRectangle.Empty
        ) ? new PixUI.Rect(0, 0, drawingContext.Width, drawingContext.Width)
            : new PixUI.Rect(clip.X, clip.Y, clip.X + clip.Width, clip.Y + clip.Height);
    }
}
