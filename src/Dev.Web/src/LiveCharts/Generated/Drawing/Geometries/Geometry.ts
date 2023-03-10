import * as PixUI from '@/PixUI'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as LiveCharts from '@/LiveCharts'

export abstract class Geometry extends LiveCharts.Drawable implements LiveChartsCore.IGeometry<LiveCharts.SkiaDrawingContext>, LiveChartsCore.IVisualChartPoint<LiveCharts.SkiaDrawingContext> {
    private readonly _hasGeometryTransform: boolean = false;
    private readonly _opacityProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _xProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _yProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _rotationProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _transformOriginProperty: LiveChartsCore.PointMotionProperty;
    private readonly _scaleProperty: LiveChartsCore.PointMotionProperty;
    private readonly _skewProperty: LiveChartsCore.PointMotionProperty;
    private readonly _translateProperty: LiveChartsCore.PointMotionProperty;
    private readonly _transformProperty: LiveCharts.SKMatrixMotionProperty;
    private _hasTransform: boolean = false;
    private _hasRotation: boolean = false;
    private _hasScale: boolean = false;
    private _hasSkew: boolean = false;
    private _hasTranslate: boolean = false;

    protected constructor(hasGeometryTransform: boolean = false) {
        super();
        this._hasGeometryTransform = hasGeometryTransform;
        this._xProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("X", 0));
        this._yProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Y", 0));
        this._opacityProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Opacity", 1));
        this._transformOriginProperty = this.RegisterMotionProperty(
            new LiveChartsCore.PointMotionProperty("TransformOrigin", new LiveChartsCore.LvcPoint(0.5, 0.5)));
        this._translateProperty = this.RegisterMotionProperty(
            new LiveChartsCore.PointMotionProperty("TranslateTransform", new LiveChartsCore.LvcPoint(0, 0)));
        this._rotationProperty = this.RegisterMotionProperty(
            new LiveChartsCore.FloatMotionProperty("RotateTransform", 0));
        this._scaleProperty = this.RegisterMotionProperty(
            new LiveChartsCore.PointMotionProperty("ScaleTransform", new LiveChartsCore.LvcPoint(1, 1)));
        this._skewProperty = this.RegisterMotionProperty(
            new LiveChartsCore.PointMotionProperty("SkewTransform", new LiveChartsCore.LvcPoint(1, 1)));
        this._transformProperty = this.RegisterMotionProperty(
            new LiveCharts.SKMatrixMotionProperty("Transform", PixUI.Matrix4.CreateIdentity()));
    }

    private get HasTransform(): boolean {
        return this._hasGeometryTransform || this._hasTranslate || this._hasRotation || this._hasScale || this._hasSkew || this._hasTransform;
    }

    public get X(): number {
        return this._xProperty.GetMovement(this);
    }

    public set X(value: number) {
        this._xProperty.SetMovement(value, this);
    }

    public get Y(): number {
        return this._yProperty.GetMovement(this);
    }

    public set Y(value: number) {
        this._yProperty.SetMovement(value, this);
    }

    public get TransformOrigin(): LiveChartsCore.LvcPoint {
        return this._transformOriginProperty.GetMovement(this);
    }

    public set TransformOrigin(value: LiveChartsCore.LvcPoint) {
        this._transformOriginProperty.SetMovement((value).Clone(), this);
    }

    public get TranslateTransform(): LiveChartsCore.LvcPoint {
        return this._translateProperty.GetMovement(this);
    }

    public set TranslateTransform(value: LiveChartsCore.LvcPoint) {
        this._translateProperty.SetMovement((value).Clone(), this);
        this._hasTranslate = value.X != 0 || value.Y != 0;
    }

    public get RotateTransform(): number {
        return this._rotationProperty.GetMovement(this);
    }

    public set RotateTransform(value: number) {
        this._rotationProperty.SetMovement(value, this);
        this._hasRotation = value != 0;
    }

    public get ScaleTransform(): LiveChartsCore.LvcPoint {
        return this._scaleProperty.GetMovement(this);
    }

    public set ScaleTransform(value: LiveChartsCore.LvcPoint) {
        this._scaleProperty.SetMovement((value).Clone(), this);
        this._hasScale = value.X != 1 || value.Y != 1;
    }

    public get SkewTransform(): LiveChartsCore.LvcPoint {
        return this._skewProperty.GetMovement(this);
    }

    public set SkewTransform(value: LiveChartsCore.LvcPoint) {
        this._skewProperty.SetMovement((value).Clone(), this);
        this._hasSkew = value.X != 0 || value.Y != 0;
    }

    public get Transform(): PixUI.Matrix4 {
        return this._transformProperty.GetMovement(this);
    }

    public set Transform(value: PixUI.Matrix4) {
        this._transformProperty.SetMovement((value).Clone(), this);
        this._hasTransform = !value.IsIdentity;
    }

    public get Opacity(): number {
        return this._opacityProperty.GetMovement(this);
    }

    public set Opacity(value: number) {
        this._opacityProperty.SetMovement(value, this);
    }

    public Stroke: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>;

    public Fill: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>;

    public get MainGeometry(): LiveChartsCore.IGeometry<LiveCharts.SkiaDrawingContext> {
        return this.GetHighlitableGeometry();
    }

    Draw(context: LiveCharts.SkiaDrawingContext) {
        if (this.HasTransform) {
            context.Canvas.save();

            let m = this.OnMeasure(context.PaintTask);
            let o = (this.TransformOrigin).Clone();
            let p = new PixUI.Point(this.X, this.Y);

            let xo = m.Width * o.X;
            let yo = m.Height * o.Y;

            if (this._hasGeometryTransform) {
                this.ApplyCustomGeometryTransform(context);
            }

            if (this._hasRotation) {
                context.Canvas.translate(p.X + xo, p.Y + yo);
                context.Canvas.rotate(this.RotateTransform, 0, 0);
                context.Canvas.translate(-p.X - xo, -p.Y - yo);
            }

            if (this._hasTranslate) {
                let translate = (this.TranslateTransform).Clone();
                context.Canvas.translate(translate.X, translate.Y);
            }

            if (this._hasScale) {
                let scale = (this.ScaleTransform).Clone();
                context.Canvas.translate(p.X + xo, p.Y + yo);
                context.Canvas.scale(scale.X, scale.Y);
                context.Canvas.translate(-p.X - xo, -p.Y - yo);
            }

            if (this._hasSkew) {
                let skew = (this.SkewTransform).Clone();
                context.Canvas.translate(p.X + xo, p.Y + yo);
                context.Canvas.skew(skew.X, skew.Y);
                context.Canvas.translate(-p.X - xo, -p.Y - yo);
            }

            if (this._hasTransform) {
                let transform = (this.Transform).Clone();
                context.Canvas.concat(transform.TransponseTo());
            }
        }

        let originalStroke: Nullable<PixUI.Paint> = null;
        if (context.PaintTask.IsStroke && this.Stroke != null) {
            this.Stroke.IsStroke = true;
            originalStroke = context.Paint;
            this.Stroke.InitializeTask(context);
        }
        let originalFill: Nullable<PixUI.Paint> = null;
        if (!context.PaintTask.IsStroke && this.Fill != null) {
            this.Fill.IsStroke = false;
            originalFill = context.Paint;
            this.Fill.InitializeTask(context);
        }

        if (this.Opacity != 1) context.PaintTask.ApplyOpacityMask(context, this);
        this.OnDraw(context, context.Paint);
        if (this.Opacity != 1) context.PaintTask.RestoreOpacityMask(context, this);

        if (context.PaintTask.IsStroke && this.Stroke != null) {
            this.Stroke.Dispose();
            if (originalStroke != null) context.Paint = originalStroke;
        }
        if (!context.PaintTask.IsStroke && this.Fill != null) {
            this.Fill.Dispose();
            if (originalFill != null) context.Paint = originalFill;
        }

        if (this.HasTransform) context.Canvas.restore();
    }

    public abstract OnDraw(context: LiveCharts.SkiaDrawingContext, paint: PixUI.Paint): void;

    public Measure(drawableTask: LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>): LiveChartsCore.LvcSize {
        let measure = this.OnMeasure(<LiveCharts.Paint><unknown>drawableTask);

        let r = this.RotateTransform;
        if (Math.abs(r) > 0) {
            let toRadias: number = Math.PI / 180;

            r %= 360;
            if (r < 0) r += 360;

            if (r > 180) r = 360 - r;
            if (r > 90 && r <= 180) r = 180 - r;

            let rRadians = r * toRadias;

            let w = <number><unknown>(Math.cos(rRadians) * measure.Width + Math.sin(rRadians) * measure.Height);
            let h = <number><unknown>(Math.sin(rRadians) * measure.Width + Math.cos(rRadians) * measure.Height);

            measure = new LiveChartsCore.LvcSize(w, h);
        }

        return measure;
    }

    protected abstract OnMeasure(paintTaks: LiveCharts.Paint): LiveChartsCore.LvcSize ;

    protected GetHighlitableGeometry(): LiveChartsCore.IGeometry<LiveCharts.SkiaDrawingContext> {
        return this;
    }

    protected ApplyCustomGeometryTransform(context: LiveCharts.SkiaDrawingContext) {
    }
}
