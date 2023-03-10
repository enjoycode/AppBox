import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as PixUI from '@/PixUI'
import * as LiveCharts from '@/LiveCharts'

export class RadialGradientPaint extends LiveCharts.Paint {
    private _drawingContext: Nullable<LiveCharts.SkiaDrawingContext>;
    private readonly _gradientStops: PixUI.Color[];
    private readonly _center: PixUI.Point;
    private readonly _radius: number;
    private readonly _colorPos: Nullable<Float32Array>;
    private readonly _tileMode: PixUI.TileMode;

    public constructor(
        gradientStops: PixUI.Color[],
        center: Nullable<PixUI.Point> = null,
        radius: number = 0.5,
        colorPos: Nullable<Float32Array> = null,
        tileMode: PixUI.TileMode = CanvasKit.TileMode.Repeat) {
        super();
        this._gradientStops = gradientStops;
        if (center == null) this._center = new PixUI.Point(0.5, 0.5);
        this._radius = radius;
        this._colorPos = colorPos;
        this._tileMode = tileMode;
    }

    // /// <summary>
    // /// Initializes a new instance of the <see cref="RadialGradientPaint"/> class.
    // /// </summary>
    // /// <param name="centerColor">Color of the center.</param>
    // /// <param name="outerColor">Color of the outer.</param>
    // public RadialGradientPaint(SKColor centerColor, SKColor outerColor)
    //     : this(new[] { centerColor, outerColor }) { }

    CloneTask(): LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext> {
        return new RadialGradientPaint(this._gradientStops, (this._center).Clone(), this._radius, this._colorPos, this._tileMode).Init(
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

    InitializeTask(drawingContext: LiveCharts.SkiaDrawingContext) {
        this._skiaPaint ??= new CanvasKit.Paint();

        let size = this.GetDrawRectangleSize(drawingContext);
        let center = new PixUI.Point(size.Left + this._center.X * size.Width, size.Top + this._center.Y * size.Height);
        let r = size.Left + size.Width > size.Top + size.Height
            ? size.Top + size.Height
            : size.Left + size.Width;
        r *= this._radius;

        this._skiaPaint.setShader(CanvasKit.Shader.MakeRadialGradient((center).Clone(), r, this._gradientStops, this._colorPos == null ? null : Array.from(this._colorPos), this._tileMode));

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

    RestoreOpacityMask(context: LiveCharts.SkiaDrawingContext, geometry: LiveChartsCore.IPaintable<LiveCharts.SkiaDrawingContext>) {
        throw new System.NotImplementedException();
    }

    ApplyOpacityMask(context: LiveCharts.SkiaDrawingContext, geometry: LiveChartsCore.IPaintable<LiveCharts.SkiaDrawingContext>) {
        throw new System.NotImplementedException();
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
            : new PixUI.Rect(clip.X, clip.Y, clip.Width, clip.Height);
    }
}
