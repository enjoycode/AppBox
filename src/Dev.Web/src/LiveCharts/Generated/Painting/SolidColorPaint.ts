import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as PixUI from '@/PixUI'
import * as LiveCharts from '@/LiveCharts'

export class SolidColorPaint extends LiveCharts.Paint {
    private _drawingContext: Nullable<LiveCharts.SkiaDrawingContext>;

    public constructor() {
        super();
    }

    public static MakeByColor(color: PixUI.Color): SolidColorPaint {
        return new SolidColorPaint().Init({Color: color});
    }

    public static MakeByColorAndStroke(color: PixUI.Color, strokeWidth: number): SolidColorPaint {
        let p = new SolidColorPaint();
        p._strokeWidthTransition =
            p.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("StrokeThickness", strokeWidth));
        p.Color = color;
        return p;
    }

    CloneTask(): LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext> {
        let clone = new SolidColorPaint().Init(
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

        return clone;
    }

    InitializeTask(drawingContext: LiveCharts.SkiaDrawingContext) {
        this._skiaPaint ??= new CanvasKit.Paint();

        this._skiaPaint.setColor(this.Color);
        this._skiaPaint.setAntiAlias(this.IsAntialias);
        this._skiaPaint.setStyle(this.IsStroke ? CanvasKit.PaintStyle.Stroke : CanvasKit.PaintStyle.Fill);
        this._skiaPaint.setStrokeCap(this.StrokeCap);
        this._skiaPaint.setStrokeJoin(this.StrokeJoin);
        this._skiaPaint.setStrokeMiter(this.StrokeMiter);
        this._skiaPaint.setStrokeWidth(this.StrokeThickness);
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
            drawingContext.Canvas.clipRect(PixUI.Rect.FromLTWH(clip.X, clip.Y, clip.Width, clip.Height), CanvasKit.ClipOp.Intersect,
                true);
            this._drawingContext = drawingContext;
        }

        drawingContext.Paint = this._skiaPaint;
        drawingContext.PaintTask = this;
    }

    ApplyOpacityMask(context: LiveCharts.SkiaDrawingContext, geometry: LiveChartsCore.IPaintable<LiveCharts.SkiaDrawingContext>) {
        if (context.PaintTask == null || context.Paint == null) return;

        let baseColor = context.PaintTask.Color;
        context.Paint.setColor(new PixUI.Color(baseColor.Red, baseColor.Green, baseColor.Blue, (Math.floor((255 * geometry.Opacity)) & 0xFF)));
    }

    RestoreOpacityMask(context: LiveCharts.SkiaDrawingContext, geometry: LiveChartsCore.IPaintable<LiveCharts.SkiaDrawingContext>) {
        if (context.PaintTask == null || context.Paint == null) return;

        let baseColor = context.PaintTask.Color;
        context.Paint.setColor(baseColor);
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
}