import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class Chart<TDrawingContext extends LiveChartsCore.DrawingContext> implements LiveChartsCore.IChart {

    public readonly _everMeasuredElements: System.HashSet<LiveChartsCore.ChartElement<TDrawingContext>> = new System.HashSet();
    public _toDeleteElements: System.HashSet<LiveChartsCore.ChartElement<TDrawingContext>> = new System.HashSet();

    public _preserveFirstDraw: boolean = false;
    private readonly _updateThrottler: LiveChartsCore.ActionThrottler;
    private readonly _tooltipThrottler: LiveChartsCore.ActionThrottler;
    private readonly _panningThrottler: LiveChartsCore.ActionThrottler;
    private _pointerPosition: LiveChartsCore.LvcPoint = (new LiveChartsCore.LvcPoint(-10, -10)).Clone();
    private _pointerPanningStartPosition: LiveChartsCore.LvcPoint = (new LiveChartsCore.LvcPoint(-10, -10)).Clone();
    private _pointerPanningPosition: LiveChartsCore.LvcPoint = (new LiveChartsCore.LvcPoint(-10, -10)).Clone();
    private _pointerPreviousPanningPosition: LiveChartsCore.LvcPoint = (new LiveChartsCore.LvcPoint(-10, -10)).Clone();
    private _isPanning: boolean = false;
    private _isPointerIn: boolean = false;
    private readonly _activePoints: System.Dictionary<LiveChartsCore.ChartPoint, any> = new System.Dictionary();
    private _previousSize: LiveChartsCore.LvcSize = LiveChartsCore.LvcSize.Empty.Clone();


    protected constructor(
        canvas: LiveChartsCore.MotionCanvas<TDrawingContext>,
        defaultPlatformConfig: System.Action1<LiveChartsCore.LiveChartsSettings>,
        view: LiveChartsCore.IChartView) {
        this.Canvas = canvas;
        canvas.Validated.Add(this.OnCanvasValidated, this);
        this.EasingFunction = LiveChartsCore.EasingFunctions.QuadraticOut;
        if (!LiveChartsCore.LiveCharts.IsConfigured) LiveChartsCore.LiveCharts.Configure(defaultPlatformConfig);

        this._updateThrottler = view.DesignerMode
            ? new LiveChartsCore.ActionThrottler(() => Promise.resolve(), System.TimeSpan.FromMilliseconds(50))
            : new LiveChartsCore.ActionThrottler(this.UpdateThrottlerUnlocked.bind(this), System.TimeSpan.FromMilliseconds(50));
        this._updateThrottler.ThrottlerTimeSpan = view.UpdaterThrottler;

        this.PointerDown.Add(this.Chart_PointerDown, this);
        this.PointerMove.Add(this.Chart_PointerMove, this);
        this.PointerUp.Add(this.Chart_PointerUp, this);
        this.PointerLeft.Add(this.Chart_PointerLeft, this);

        this._tooltipThrottler = new LiveChartsCore.ActionThrottler(this.TooltipThrottlerUnlocked.bind(this), System.TimeSpan.FromMilliseconds(10));
        this._panningThrottler = new LiveChartsCore.ActionThrottler(this.PanningThrottlerUnlocked.bind(this), System.TimeSpan.FromMilliseconds(30));
    }

    public readonly Measuring = new System.Event<LiveChartsCore.IChartView1<TDrawingContext>>();

    public readonly UpdateStarted = new System.Event<LiveChartsCore.IChartView1<TDrawingContext>>();

    public readonly UpdateFinished = new System.Event<LiveChartsCore.IChartView1<TDrawingContext>>();

    public readonly PointerDown = new System.Event<LiveChartsCore.LvcPoint>();

    public readonly PointerMove = new System.Event<LiveChartsCore.LvcPoint>();

    public readonly PointerUp = new System.Event<LiveChartsCore.LvcPoint>();

    public readonly PointerLeft = new System.Event();

    public readonly PanGesture = new System.Event<LiveChartsCore.PanGestureEventArgs>();


    public get ActualBounds(): LiveChartsCore.AnimatableContainer {
        return new LiveChartsCore.AnimatableContainer();
    }

    #MeasureWork: any = {};
    public get MeasureWork() {
        return this.#MeasureWork;
    }

    protected set MeasureWork(value) {
        this.#MeasureWork = value;
    }

    #ThemeId: any = {};
    public get ThemeId() {
        return this.#ThemeId;
    }

    protected set ThemeId(value) {
        this.#ThemeId = value;
    }

    #IsLoaded: boolean = false;
    public get IsLoaded() {
        return this.#IsLoaded;
    }

    public set IsLoaded(value) {
        this.#IsLoaded = value;
    }

    #IsFirstDraw: boolean = true;
    public get IsFirstDraw() {
        return this.#IsFirstDraw;
    }

    public set IsFirstDraw(value) {
        this.#IsFirstDraw = value;
    }

    #Canvas: LiveChartsCore.MotionCanvas<TDrawingContext>;
    public get Canvas() {
        return this.#Canvas;
    }

    private set Canvas(value) {
        this.#Canvas = value;
    }

    public abstract get ChartSeries(): System.IEnumerable<LiveChartsCore.IChartSeries<TDrawingContext>> ;


    public abstract get View(): LiveChartsCore.IChartView1<TDrawingContext> ;


    #SeriesContext: LiveChartsCore.SeriesContext<TDrawingContext> = new LiveChartsCore.SeriesContext([]);
    public get SeriesContext() {
        return this.#SeriesContext;
    }

    protected set SeriesContext(value) {
        this.#SeriesContext = value;
    }

    #ControlSize: LiveChartsCore.LvcSize = LiveChartsCore.LvcSize.Empty.Clone();
    public get ControlSize() {
        return this.#ControlSize;
    }

    protected set ControlSize(value) {
        this.#ControlSize = value;
    }

    #DrawMarginLocation: LiveChartsCore.LvcPoint = LiveChartsCore.LvcPoint.Empty.Clone();
    public get DrawMarginLocation() {
        return this.#DrawMarginLocation;
    }

    protected set DrawMarginLocation(value) {
        this.#DrawMarginLocation = value;
    }

    #DrawMarginSize: LiveChartsCore.LvcSize = LiveChartsCore.LvcSize.Empty.Clone();
    public get DrawMarginSize() {
        return this.#DrawMarginSize;
    }

    protected set DrawMarginSize(value) {
        this.#DrawMarginSize = value;
    }

    #LegendPosition: LiveChartsCore.LegendPosition = 0;
    public get LegendPosition() {
        return this.#LegendPosition;
    }

    protected set LegendPosition(value) {
        this.#LegendPosition = value;
    }

    #Legend: Nullable<LiveChartsCore.IChartLegend<TDrawingContext>>;
    public get Legend() {
        return this.#Legend;
    }

    protected set Legend(value) {
        this.#Legend = value;
    }

    #TooltipPosition: LiveChartsCore.TooltipPosition = 0;
    public get TooltipPosition() {
        return this.#TooltipPosition;
    }

    protected set TooltipPosition(value) {
        this.#TooltipPosition = value;
    }

    #TooltipFindingStrategy: LiveChartsCore.TooltipFindingStrategy = 0;
    public get TooltipFindingStrategy() {
        return this.#TooltipFindingStrategy;
    }

    protected set TooltipFindingStrategy(value) {
        this.#TooltipFindingStrategy = value;
    }

    #Tooltip: Nullable<LiveChartsCore.IChartTooltip<TDrawingContext>>;
    public get Tooltip() {
        return this.#Tooltip;
    }

    protected set Tooltip(value) {
        this.#Tooltip = value;
    }

    #AnimationsSpeed: System.TimeSpan = System.TimeSpan.Empty.Clone();
    public get AnimationsSpeed() {
        return this.#AnimationsSpeed;
    }

    protected set AnimationsSpeed(value) {
        this.#AnimationsSpeed = value;
    }

    #EasingFunction: Nullable<System.Func2<number, number>>;
    public get EasingFunction() {
        return this.#EasingFunction;
    }

    protected set EasingFunction(value) {
        this.#EasingFunction = value;
    }

    #VisualElements: LiveChartsCore.ChartElement<TDrawingContext>[] = [];
    public get VisualElements() {
        return this.#VisualElements;
    }

    protected set VisualElements(value) {
        this.#VisualElements = value;
    }

    #PreviousLegendPosition: LiveChartsCore.LegendPosition = 0;
    public get PreviousLegendPosition() {
        return this.#PreviousLegendPosition;
    }

    protected set PreviousLegendPosition(value) {
        this.#PreviousLegendPosition = value;
    }

    #PreviousSeriesAtLegend: LiveChartsCore.IChartSeries<TDrawingContext>[] = [];
    public get PreviousSeriesAtLegend() {
        return this.#PreviousSeriesAtLegend;
    }

    protected set PreviousSeriesAtLegend(value) {
        this.#PreviousSeriesAtLegend = value;
    }


    public Update(chartUpdateParams: Nullable<LiveChartsCore.ChartUpdateParams> = null) {
        chartUpdateParams ??= new LiveChartsCore.ChartUpdateParams();

        if (chartUpdateParams.IsAutomaticUpdate && !this.View.AutoUpdateEnabled) return;

        this._updateThrottler.ThrottlerTimeSpan = this.View.UpdaterThrottler;

        if (!chartUpdateParams.Throttling) {
            this._updateThrottler.ForceCall();
            return;
        }

        this._updateThrottler.Call();
    }

    public abstract FindHoveredPointsBy(pointerPosition: LiveChartsCore.LvcPoint): System.IEnumerable<LiveChartsCore.ChartPoint> ;

    public Load() {
        this.IsLoaded = true;
        this.IsFirstDraw = true;
        this.Update();
    }

    public Unload() {
        this.IsLoaded = false;
        this._everMeasuredElements.Clear();
        this._toDeleteElements.Clear();
        this._activePoints.Clear();
        this.Canvas.Dispose();
    }

    public ClearTooltipData() {
        for (const point of this._activePoints.Keys.ToArray()) {
            let cp = <LiveChartsCore.ChartPoint><unknown>point;
            cp.Context.Series.OnPointerLeft(cp);
            this._activePoints.Remove(point);
        }

        this.Canvas.Invalidate();
    }

    public InvokePointerDown(point: LiveChartsCore.LvcPoint, isSecondaryAction: boolean) {
        this.PointerDown.Invoke((point).Clone());

        let strategy = LiveChartsCore.Extensions.GetTooltipFindingStrategy(this.ChartSeries,);

        // fire the series event.
        for (const series of this.ChartSeries) {
            if (!series.RequiresFindClosestOnPointerDown) continue;

            let points = series.FindHitPoints(this, (point).Clone(), strategy);
            if (!points.Any()) continue;

            series.OnDataPointerDown(this.View, points, (point).Clone());
        }

        // fire the chart event.
        let iterablePoints = this.ChartSeries.SelectMany(x => x.FindHitPoints(this, (point).Clone(), strategy));
        this.View.OnDataPointerDown(iterablePoints, (point).Clone());

        // fire the visual elements event.
        // ToDo: VisualElements should be of type VisualElement<T>
        let iterableVisualElements = this.VisualElements.Cast<LiveChartsCore.VisualElement<TDrawingContext>>().SelectMany(x => x.IsHitBy(this, (point).Clone()));
        this.View.OnVisualElementPointerDown(iterableVisualElements, (point).Clone());
    }

    public InvokePointerMove(point: LiveChartsCore.LvcPoint) {
        this.PointerMove.Invoke((point).Clone());
    }

    public InvokePointerUp(point: LiveChartsCore.LvcPoint, isSecondaryAction: boolean) {
        this.PointerUp.Invoke((point).Clone());
    }

    public InvokePointerLeft() {
        this.PointerLeft.Invoke();
    }

    public InvokePanGestrue(eventArgs: LiveChartsCore.PanGestureEventArgs) {
        this.PanGesture.Invoke(eventArgs);
    }

    public abstract Measure(): void;

    protected SetDrawMargin(controlSize: LiveChartsCore.LvcSize, margin: LiveChartsCore.Margin) {
        this.DrawMarginSize = new LiveChartsCore.LvcSize().Init(
            {
                Width: controlSize.Width - margin.Left - margin.Right,
                Height: controlSize.Height - margin.Top - margin.Bottom
            });

        this.DrawMarginLocation = new LiveChartsCore.LvcPoint(margin.Left, margin.Top);
    }

    protected SetPreviousSize() {
        this._previousSize = (this.ControlSize).Clone();
    }

    protected InvokeOnMeasuring() {
        this.Measuring.Invoke(this.View);
    }

    protected InvokeOnUpdateStarted() {
        this.SetPreviousSize();
        this.UpdateStarted.Invoke(this.View);
    }

    protected InvokeOnUpdateFinished() {
        this.UpdateFinished.Invoke(this.View);
    }

    protected SizeChanged(): boolean {
        return this._previousSize.Width != this.ControlSize.Width || this._previousSize.Height != this.ControlSize.Height;
    }

    protected SeriesMiniatureChanged(newSeries: LiveChartsCore.IChartSeries<TDrawingContext>[], position: LiveChartsCore.LegendPosition): boolean {
        if (position == LiveChartsCore.LegendPosition.Hidden && this.PreviousLegendPosition == LiveChartsCore.LegendPosition.Hidden) return false;
        if (position != this.PreviousLegendPosition) return true;
        if (this.PreviousSeriesAtLegend.length != newSeries.length) return true;

        for (let i = 0; i < newSeries.length; i++) {
            if (i + 1 > this.PreviousSeriesAtLegend.length) return true;

            let a = this.PreviousSeriesAtLegend[i];
            let b = newSeries[i];

            if (!a.MiniatureEquals(b)) return true;
        }

        return false;
    }

    protected UpdateThrottlerUnlocked(): Promise<void> {
        return new Promise<void>($resolve => {
            this.View.InvokeOnUIThread(() => {
                {
                    this.Measure();
                }
            });
            $resolve();
        });
    }

    protected UpdateBounds() {
        this.ActualBounds.Location = (this.DrawMarginLocation).Clone();
        this.ActualBounds.Size = (this.DrawMarginSize).Clone();

        if (this.IsFirstDraw) {
            LiveChartsCore.Extensions.TransitionateProperties(this.ActualBounds
                , null)
                .WithAnimationBuilder(animation =>
                    animation
                        .WithDuration(this.AnimationsSpeed)
                        .WithEasingFunction(this.EasingFunction))
                .CompleteCurrentTransitions();
            this.Canvas.Trackers.Add(this.ActualBounds);
        }
    }

    protected InitializeVisualsCollector() {
        this._toDeleteElements = new System.HashSet<LiveChartsCore.ChartElement<TDrawingContext>>(this._everMeasuredElements);
    }

    public AddVisual(element: LiveChartsCore.ChartElement<TDrawingContext>) {
        element.Invalidate(this);
        element.RemoveOldPaints(this.View);
        this._everMeasuredElements.Add(element);
        this._toDeleteElements.Remove(element);
    }

    public RemoveVisual(element: LiveChartsCore.ChartElement<TDrawingContext>) {
        element.RemoveFromUI(this);
        this._everMeasuredElements.Remove(element);
        this._toDeleteElements.Remove(element);
    }

    protected CollectVisuals() {
        for (const visual of this._toDeleteElements) {
            if (LiveChartsCore.IsInterfaceOfISeries(visual)) {
                const series = visual;
                // series delete softly and animate as they leave the UI.
                series.SoftDeleteOrDispose(this.View);
            } else {
                visual.RemoveFromUI(this);
            }
            this._everMeasuredElements.Remove(visual);
        }

        this._toDeleteElements = new System.HashSet<LiveChartsCore.ChartElement<TDrawingContext>>();
    }

    protected DrawLegend(seriesInLegend: LiveChartsCore.IChartSeries<TDrawingContext>[]) {
        if (this.Legend != null && (this.SeriesMiniatureChanged(seriesInLegend, this.LegendPosition) || this.SizeChanged())) {
            if (LiveChartsCore.IsInterfaceOfIImageControl(this.Legend)) {
                const imageLegend = this.Legend;
                // this is the preferred method (drawn legends)
                imageLegend.Measure(this);

                if (this.LegendPosition == LiveChartsCore.LegendPosition.Left || this.LegendPosition == LiveChartsCore.LegendPosition.Right)
                    this.ControlSize = (new LiveChartsCore.LvcSize(this.ControlSize.Width - imageLegend.Size.Width, this.ControlSize.Height)).Clone();

                if (this.LegendPosition == LiveChartsCore.LegendPosition.Top || this.LegendPosition == LiveChartsCore.LegendPosition.Bottom)
                    this.ControlSize = (new LiveChartsCore.LvcSize(this.ControlSize.Width, this.ControlSize.Height - imageLegend.Size.Height)).Clone();

                // reset for cases when legend is hidden or changes postion
                this.Canvas.StartPoint = new LiveChartsCore.LvcPoint(0, 0);

                this.Legend.Draw(this);

                this.PreviousLegendPosition = this.LegendPosition;
                this.PreviousSeriesAtLegend = seriesInLegend;
                for (const series of this.PreviousSeriesAtLegend.Cast<LiveChartsCore.ISeries>()) series.PaintsChanged = false;
                this._preserveFirstDraw = this.IsFirstDraw;
            } else {
                // the legend is drawn by the UI framework... lets return and wait for it to draw/measure it.
                // maybe we should wait for the legend to draw and then draw the chart?
                this.Legend.Draw(this);
                this.PreviousLegendPosition = this.LegendPosition;
                this.PreviousSeriesAtLegend = seriesInLegend;
                for (const series of this.PreviousSeriesAtLegend.Cast<LiveChartsCore.ISeries>()) series.PaintsChanged = false;
                this._preserveFirstDraw = this.IsFirstDraw;
                this.SetPreviousSize();
                this.Measure();
                return;
            }
        }
    }

    private TooltipThrottlerUnlocked(): Promise<void> {
        return new Promise<void>($resolve => {
            this.View.InvokeOnUIThread(() => {
                {
                    if (this._pointerPosition.X < this.DrawMarginLocation.X || this._pointerPosition.X > this.DrawMarginLocation.X + this.DrawMarginSize.Width ||
                        this._pointerPosition.Y < this.DrawMarginLocation.Y || this._pointerPosition.Y > this.DrawMarginLocation.Y + this.DrawMarginSize.Height) {
                        // reject tooltip logic when the pointer is outside the draw margin
                        return;
                    }


                    // TODO:
                    // all this needs a performance review...
                    // it should not be critical, should not be even close to be the 'bottle neck' in a case where
                    // we face performance issues.

                    let points = this.FindHoveredPointsBy((this._pointerPosition).Clone());
                    if (!points.Any()) {
                        this.ClearTooltipData();
                        this.Tooltip?.Hide();
                        return;
                    }

                    if (this._activePoints.length > 0 && points.All(x => this._activePoints.ContainsKey(x))) return;

                    let o = {};
                    for (const tooltipPoint of points) {
                        tooltipPoint.Context.Series.OnPointerEnter(tooltipPoint);
                        this._activePoints.SetAt(tooltipPoint, o);
                    }

                    for (const point of this._activePoints.Keys.ToArray()) {
                        if (this._activePoints.GetAt(point) == o) continue;
                        point.Context.Series.OnPointerLeft(point);
                        this._activePoints.Remove(point);
                    }

                    if (this.TooltipPosition != LiveChartsCore.TooltipPosition.Hidden) this.Tooltip?.Show(points, this);
                    this.Canvas.Invalidate();
                }
            });
            $resolve();
        });
    }

    private PanningThrottlerUnlocked(): Promise<void> {
        return new Promise<void>($resolve => {
            this.View.InvokeOnUIThread(() => {
                let cartesianChart: LiveChartsCore.CartesianChart<TDrawingContext>;
                if (this instanceof LiveChartsCore.CartesianChart<TDrawingContext>)
                    cartesianChart = (this as LiveChartsCore.CartesianChart<TDrawingContext>)!;
                else
                    return;
                {
                    let dx = this._pointerPanningPosition.X - this._pointerPreviousPanningPosition.X;
                    let dy = this._pointerPanningPosition.Y - this._pointerPreviousPanningPosition.Y;

                    // we need to send a dummy value indicating the direction (val > 0)
                    // so the core is able to bounce the panning when the user reaches the limit.
                    if (dx == 0) dx = this._pointerPanningStartPosition.X - this._pointerPanningPosition.X > 0 ? -0.01 : 0.01;
                    if (dy == 0) dy = this._pointerPanningStartPosition.Y - this._pointerPanningPosition.Y > 0 ? -0.01 : 0.01;

                    cartesianChart.Pan(new LiveChartsCore.LvcPoint(dx, dy), this._isPanning);
                    this._pointerPreviousPanningPosition = new LiveChartsCore.LvcPoint(this._pointerPanningPosition.X, this._pointerPanningPosition.Y);
                }
            });
            $resolve();
        });
    }

    private OnCanvasValidated(chart: LiveChartsCore.MotionCanvas<TDrawingContext>) {
        this.InvokeOnUpdateFinished();
    }

    private Chart_PointerDown(pointerPosition: LiveChartsCore.LvcPoint) {
        this._isPanning = true;
        this._pointerPreviousPanningPosition = (pointerPosition).Clone();
        this._pointerPanningStartPosition = (pointerPosition).Clone();
    }

    private Chart_PointerMove(pointerPosition: LiveChartsCore.LvcPoint) {
        this._pointerPosition = (pointerPosition).Clone();
        this._isPointerIn = true;
        this._tooltipThrottler.Call();
        if (!this._isPanning) return;
        this._pointerPanningPosition = (pointerPosition).Clone();
        this._panningThrottler.Call();
    }

    private Chart_PointerLeft() {
        this._isPointerIn = false;
    }

    private Chart_PointerUp(pointerPosition: LiveChartsCore.LvcPoint) {
        if (!this._isPanning) return;
        this._isPanning = false;
        this._pointerPanningPosition = (pointerPosition).Clone();
        this._panningThrottler.Call();
    }
}
