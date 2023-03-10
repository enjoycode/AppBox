import * as PixUI from '@/PixUI'
import * as System from '@/System'
import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class Paint extends LiveChartsCore.Animatable implements LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext> {
    private readonly _strokeMiterTransition: LiveChartsCore.FloatMotionProperty;
    private readonly _geometriesByCanvas: System.Dictionary<any, System.HashSet<LiveChartsCore.IDrawable<LiveCharts.SkiaDrawingContext>>> = new System.Dictionary();
    private readonly _clipRectangles: System.Dictionary<any, LiveChartsCore.LvcRectangle> = new System.Dictionary();
    private _matchesChar: Nullable<number> = null;
    public _skiaPaint: Nullable<PixUI.Paint>;
    public _strokeWidthTransition: LiveChartsCore.FloatMotionProperty;
    private _fontFamily: Nullable<string>;

    protected constructor() {
        super();
        this._strokeWidthTransition = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("StrokeThickness", 0));
        this._strokeMiterTransition = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("StrokeMiter", 0));
    }

    public ZIndex: number = 0;

    public get StrokeThickness(): number {
        return this._strokeWidthTransition.GetMovement(this);
    }

    public set StrokeThickness(value: number) {
        this._strokeWidthTransition.SetMovement(value, this);
    }

    public Style: PixUI.PaintStyle = CanvasKit.PaintStyle.Fill;

    public IsStroke: boolean = false;

    public IsFill: boolean = false;

    public get FontFamily(): Nullable<string> {
        return this._fontFamily;
    }

    public set FontFamily(value: Nullable<string>) {
        this._fontFamily = value;
    }

    public SKFontStyle: Nullable<PixUI.FontStyle>;

    public SKTypeface: Nullable<PixUI.Typeface>;

    public get HasCustomFont(): boolean {
        return LiveCharts.LiveChartsSkiaSharp.DefaultSKTypeface != null ||
            this.FontFamily != null || this.SKTypeface != null || this.SKFontStyle != null;
    }

    public IsAntialias: boolean = true;

    public StrokeCap: PixUI.StrokeCap = CanvasKit.StrokeCap.Butt;

    public StrokeJoin: PixUI.StrokeJoin = CanvasKit.StrokeJoin.Miter;

    public get StrokeMiter(): number {
        return this._strokeMiterTransition.GetMovement(this);
    }

    public set StrokeMiter(value: number) {
        this._strokeMiterTransition.SetMovement(value, this);
    }

    public Color: PixUI.Color = PixUI.Color.Empty.Clone();

    public IsPaused: boolean = false;

    public PathEffect: Nullable<LiveCharts.PathEffect>;

    public ImageFilter: Nullable<LiveCharts.ImageFilter>;

    public abstract InitializeTask(drawingContext: LiveCharts.SkiaDrawingContext): void;

    public GetGeometries(canvas: LiveChartsCore.MotionCanvas<LiveCharts.SkiaDrawingContext>): System.IEnumerable<LiveChartsCore.IDrawable<LiveCharts.SkiaDrawingContext>> {
        const _$generator = function* (this: any, canvas: LiveChartsCore.MotionCanvas<LiveCharts.SkiaDrawingContext>) {
            let enumerable = this.GetGeometriesByCanvas(canvas);
            if (enumerable == null) return;

            for (const item of enumerable) {
                yield item;
            }
        }
            .bind(this);
        return System.EnumerableFrom(() => _$generator(canvas));
    }

    public SetGeometries(canvas: LiveChartsCore.MotionCanvas<LiveCharts.SkiaDrawingContext>,
                         geometries: System.HashSet<LiveChartsCore.IDrawable<LiveCharts.SkiaDrawingContext>>) {
        this._geometriesByCanvas.SetAt(canvas.Sync, geometries);
        this.IsValid = false;
    }

    public AddGeometryToPaintTask(canvas: LiveChartsCore.MotionCanvas<LiveCharts.SkiaDrawingContext>,
                                  geometry: LiveChartsCore.IDrawable<LiveCharts.SkiaDrawingContext>) {
        let g = this.GetGeometriesByCanvas(canvas);
        if (g == null) {
            g = new System.HashSet<LiveChartsCore.IDrawable<LiveCharts.SkiaDrawingContext>>();
            this._geometriesByCanvas.SetAt(canvas.Sync, g);
        }
        g.Add(geometry);
        this.IsValid = false;
    }

    public RemoveGeometryFromPainTask(canvas: LiveChartsCore.MotionCanvas<LiveCharts.SkiaDrawingContext>,
                                      geometry: LiveChartsCore.IDrawable<LiveCharts.SkiaDrawingContext>) {
        this.GetGeometriesByCanvas(canvas)?.Remove(geometry);
        this.IsValid = false;
    }

    public ClearGeometriesFromPaintTask(canvas: LiveChartsCore.MotionCanvas<LiveCharts.SkiaDrawingContext>) {
        this.GetGeometriesByCanvas(canvas)?.Clear();
        this.IsValid = false;
    }

    public ReleaseCanvas(canvas: LiveChartsCore.MotionCanvas<LiveCharts.SkiaDrawingContext>) {
        this._geometriesByCanvas.Remove(canvas);
    }

    public GetClipRectangle(canvas: LiveChartsCore.MotionCanvas<LiveCharts.SkiaDrawingContext>): LiveChartsCore.LvcRectangle {
        let clip: any;
        return this._clipRectangles.TryGetValue(canvas.Sync, new System.Out(() => clip, $v => clip = $v)) ? clip : LiveChartsCore.LvcRectangle.Empty;
    }

    public SetClipRectangle(canvas: LiveChartsCore.MotionCanvas<LiveCharts.SkiaDrawingContext>, value: LiveChartsCore.LvcRectangle) {
        this._clipRectangles.SetAt(canvas.Sync, value);
    }

    public abstract CloneTask(): LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext> ;

    public abstract ApplyOpacityMask(context: LiveCharts.SkiaDrawingContext, geometry: LiveChartsCore.IPaintable<LiveCharts.SkiaDrawingContext>): void;

    public abstract RestoreOpacityMask(context: LiveCharts.SkiaDrawingContext, geometry: LiveChartsCore.IPaintable<LiveCharts.SkiaDrawingContext>): void;

    public Dispose() {
        this._skiaPaint?.delete();
        this._skiaPaint = null;
    }

    public GetSKTypeface(): PixUI.Typeface {
        // // return the defined typeface.
        // if (SKTypeface is not null) return SKTypeface;
        //
        // // Obsolete method used in older versions of LiveCharts...
        // if (_matchesChar is not null) return SKFontManager.Default.MatchCharacter(_matchesChar.Value);
        //
        // // create one from the font family.
        // if (FontFamily is not null) return SKTypeface.FromFamilyName(_fontFamily, SKFontStyle ?? new SKFontStyle());
        //
        // // other wise ose the globally defined typeface.
        // return LiveChartsSkiaSharp.DefaultSKTypeface ?? SKTypeface.Default;

        //TODO: return null now
        return null;
    }

    private GetGeometriesByCanvas(canvas: LiveChartsCore.MotionCanvas<LiveCharts.SkiaDrawingContext>): Nullable<System.HashSet<LiveChartsCore.IDrawable<LiveCharts.SkiaDrawingContext>>> {
        let geometries: any;
        return this._geometriesByCanvas.TryGetValue(canvas.Sync, new System.Out(() => geometries, $v => geometries = $v)) ? geometries : null;
    }
}