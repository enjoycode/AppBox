import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class GeoMap<TDrawingContext extends LiveChartsCore.DrawingContext> {
    private readonly _everMeasuredSeries: System.HashSet<LiveChartsCore.IGeoSeries1<TDrawingContext>> = new System.HashSet();
    private readonly _updateThrottler: LiveChartsCore.ActionThrottler;
    private readonly _panningThrottler: LiveChartsCore.ActionThrottler;
    private _isHeatInCanvas: boolean = false;
    private _heatPaint: LiveChartsCore.IPaint<TDrawingContext>;
    private _previousStroke: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _previousFill: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _pointerPanningPosition: LiveChartsCore.LvcPoint = (new LiveChartsCore.LvcPoint(-10, -10)).Clone();
    private _pointerPreviousPanningPosition: LiveChartsCore.LvcPoint = (new LiveChartsCore.LvcPoint(-10, -10)).Clone();
    private _isPanning: boolean = false;
    private _mapFactory: LiveChartsCore.IMapFactory<TDrawingContext>;
    private _activeMap: Nullable<LiveChartsCore.CoreMap<TDrawingContext>>;
    private _isUnloaded: boolean = false;

    public constructor(mapView: LiveChartsCore.IGeoMapView<TDrawingContext>) {
        this.View = mapView;
        this._updateThrottler = mapView.DesignerMode
            ? new LiveChartsCore.ActionThrottler(() => Promise.resolve(), System.TimeSpan.FromMilliseconds(50))
            : new LiveChartsCore.ActionThrottler(this.UpdateThrottlerUnlocked.bind(this), System.TimeSpan.FromMilliseconds(100));
        this._heatPaint = LiveChartsCore.LiveCharts.DefaultSettings.GetProvider<TDrawingContext>().GetSolidColorPaint();
        this._mapFactory = LiveChartsCore.LiveCharts.DefaultSettings.GetProvider<TDrawingContext>().GetDefaultMapFactory();

        this.PointerDown.Add(this.Chart_PointerDown, this);
        this.PointerMove.Add(this.Chart_PointerMove, this);
        this.PointerUp.Add(this.Chart_PointerUp, this);
        this.PointerLeft.Add(this.Chart_PointerLeft, this);

        this._panningThrottler = new LiveChartsCore.ActionThrottler(this.PanningThrottlerUnlocked.bind(this), System.TimeSpan.FromMilliseconds(30));
    }

    public readonly PointerDown = new System.Event<LiveChartsCore.LvcPoint>();
    public readonly PointerMove = new System.Event<LiveChartsCore.LvcPoint>();
    public readonly PointerUp = new System.Event<LiveChartsCore.LvcPoint>();
    public readonly PointerLeft = new System.Event();
    public readonly PanGesture = new System.Event<LiveChartsCore.PanGestureEventArgs>();

    #View: LiveChartsCore.IGeoMapView<TDrawingContext>;
    public get View() {
        return this.#View;
    }

    private set View(value) {
        this.#View = value;
    }

    public ViewTo(command: any) {
        this._mapFactory.ViewTo(this, command);
    }

    public Pan(delta: LiveChartsCore.LvcPoint) {
        this._mapFactory.Pan(this, (delta).Clone());
    }

    public Update(chartUpdateParams: Nullable<LiveChartsCore.ChartUpdateParams> = null) {
        chartUpdateParams ??= new LiveChartsCore.ChartUpdateParams();

        if (chartUpdateParams.IsAutomaticUpdate && !this.View.AutoUpdateEnabled) return;

        if (!chartUpdateParams.Throttling) {
            this._updateThrottler.ForceCall();
            return;
        }

        this._updateThrottler.Call();
    }

    public Unload() {
        if (this.View.Stroke != null) this.View.Canvas.RemovePaintTask(this.View.Stroke);
        if (this.View.Fill != null) this.View.Canvas.RemovePaintTask(this.View.Fill);

        this._everMeasuredSeries.Clear();
        this._heatPaint = null!;
        this._previousStroke = null!;
        this._previousFill = null!;
        this._isUnloaded = true;
        this._mapFactory.Dispose();
        this._activeMap?.Dispose();

        this._activeMap = null!;
        this._mapFactory = null!;

        this.View.Canvas.Dispose();
    }

    public InvokePointerDown(point: LiveChartsCore.LvcPoint) {
        this.PointerDown.Invoke((point).Clone());
    }

    public InvokePointerMove(point: LiveChartsCore.LvcPoint) {
        this.PointerMove.Invoke((point).Clone());
    }

    public InvokePointerUp(point: LiveChartsCore.LvcPoint) {
        this.PointerUp.Invoke((point).Clone());
    }

    public InvokePointerLeft() {
        this.PointerLeft.Invoke();
    }

    public InvokePanGestrue(eventArgs: LiveChartsCore.PanGestureEventArgs) {
        this.PanGesture.Invoke(eventArgs);
    }

    protected UpdateThrottlerUnlocked(): Promise<void> {
        return new Promise<void>($resolve => {
            this.View.InvokeOnUIThread(() => {
                {
                    if (this._isUnloaded) return;
                    this.Measure();
                }
            });
            $resolve();
        });
    }

    public Measure() {
        if (this._activeMap != null && this._activeMap != this.View.ActiveMap) {
            this._previousStroke?.ClearGeometriesFromPaintTask(this.View.Canvas);
            this._previousFill?.ClearGeometriesFromPaintTask(this.View.Canvas);

            this._previousFill = null;
            this._previousStroke = null;

            this.View.Canvas.Clear();
        }
        this._activeMap = this.View.ActiveMap;

        if (!this._isHeatInCanvas) {
            this.View.Canvas.AddDrawableTask(this._heatPaint);
            this._isHeatInCanvas = true;
        }

        if (this._previousStroke != this.View.Stroke) {
            if (this._previousStroke != null)
                this.View.Canvas.RemovePaintTask(this._previousStroke);

            if (this.View.Stroke != null) {
                if (this.View.Stroke.ZIndex == 0) this.View.Stroke.ZIndex = 2;
                this.View.Stroke.IsStroke = true;
                this.View.Stroke.IsFill = false;
                this.View.Canvas.AddDrawableTask(this.View.Stroke);
            }

            this._previousStroke = this.View.Stroke;
        }

        if (this._previousFill != this.View.Fill) {
            if (this._previousFill != null)
                this.View.Canvas.RemovePaintTask(this._previousFill);

            if (this.View.Fill != null) {
                this.View.Fill.IsStroke = false;
                this.View.Fill.IsFill = true;
                this.View.Canvas.AddDrawableTask(this.View.Fill);
            }

            this._previousFill = this.View.Fill;
        }

        let i = this._previousFill?.ZIndex ?? 0;
        this._heatPaint.ZIndex = i + 1;

        let context = new LiveChartsCore.MapContext<TDrawingContext>(this, this.View, this.View.ActiveMap,
            LiveChartsCore.Maps.BuildProjector(this.View.MapProjection, this.View.Width, this.View.Height));

        this._mapFactory.GenerateLands(context);

        let toDeleteSeries = new System.HashSet<LiveChartsCore.IGeoSeries1<TDrawingContext>>(this._everMeasuredSeries);
        for (const series of this.View.Series.Cast<LiveChartsCore.IGeoSeries1<TDrawingContext>>()) {
            series.Measure(context);
            this._everMeasuredSeries.Add(series);
            toDeleteSeries.Remove(series);
        }

        for (const series of toDeleteSeries) {
            series.Delete(context);
            this._everMeasuredSeries.Remove(series);
        }

        this.View.Canvas.Invalidate();
    }

    private PanningThrottlerUnlocked(): Promise<void> {
        return new Promise<void>($resolve => {
            this.View.InvokeOnUIThread(() => {
                {
                    this.Pan(
                        new LiveChartsCore.LvcPoint(<number><unknown>(this._pointerPanningPosition.X - this._pointerPreviousPanningPosition.X),
                            <number><unknown>(this._pointerPanningPosition.Y - this._pointerPreviousPanningPosition.Y)));
                    this._pointerPreviousPanningPosition = new LiveChartsCore.LvcPoint(this._pointerPanningPosition.X, this._pointerPanningPosition.Y);
                }
            });
            $resolve();
        });
    }

    private Chart_PointerDown(pointerPosition: LiveChartsCore.LvcPoint) {
        this._isPanning = true;
        this._pointerPreviousPanningPosition = (pointerPosition).Clone();
    }

    private Chart_PointerMove(pointerPosition: LiveChartsCore.LvcPoint) {
        if (!this._isPanning) return;
        this._pointerPanningPosition = (pointerPosition).Clone();
        this._panningThrottler.Call();
    }

    private Chart_PointerLeft() {

    }

    private Chart_PointerUp(pointerPosition: LiveChartsCore.LvcPoint) {
        if (!this._isPanning) return;
        this._isPanning = false;
        this._panningThrottler.Call();
    }
}
