import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class Series<TModel, TVisual extends object & LiveChartsCore.IVisualChartPoint<TDrawingContext>, TLabel extends object & LiveChartsCore.ILabelGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.ChartElement<TDrawingContext> implements LiveChartsCore.ISeries, LiveChartsCore.ISeries1<TModel>, System.INotifyPropertyChanged {
    private static readonly $meta_LiveChartsCore_ISeries = true;
    private static readonly $meta_System_INotifyPropertyChanged = true;
    protected readonly subscribedTo: System.HashSet<LiveChartsCore.IChart> = new System.HashSet();

    protected readonly implementsICP: boolean;

    protected pivot: number = 0;

    protected static readonly MAX_MINIATURE_STROKE_WIDTH: number = 3.5;

    protected everFetched: System.HashSet<LiveChartsCore.ChartPoint> = new System.HashSet();

    protected hoverPaint: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    protected _requestedCustomMeasureHandler: boolean = false;

    protected _customMeasureHandler: Nullable<System.Action1<LiveChartsCore.Chart<TDrawingContext>>> = null;

    private readonly _observer: LiveChartsCore.CollectionDeepObserver<TModel>;
    private _values: Nullable<System.IEnumerable<TModel>>;
    private _name: Nullable<string>;
    private _mapping: Nullable<System.Action2<TModel, LiveChartsCore.ChartPoint>>;
    private _zIndex: number = 0;
    private _tooltipLabelFormatter: System.Func2<LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>, string> = (point) => `${point.Context.Series.Name} ${point.PrimaryValue}`;
    private _dataLabelsFormatter: System.Func2<LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>, string> = (point) => `${point.PrimaryValue}`;
    private _isVisible: boolean = true;
    private _dataPadding: LiveChartsCore.LvcPoint = (new LiveChartsCore.LvcPoint(0.5, 0.5)).Clone();
    private _dataFactory: Nullable<LiveChartsCore.DataFactory<TModel, TDrawingContext>>;
    private _isVisibleAtLegend: boolean = true;
    private _miniatureShapeSize: number = 12;
    private _miniatureSketch: LiveChartsCore.Sketch<TDrawingContext> = new LiveChartsCore.Sketch();
    private _easingFunction: Nullable<System.Func2<number, number>>;
    private _animationsSpeed: Nullable<System.TimeSpan>;

    protected constructor(properties: LiveChartsCore.SeriesProperties) {
        super();
        this.SeriesProperties = properties;
        this._observer = new LiveChartsCore.CollectionDeepObserver<TModel>((sender, e) => this.NotifySubscribers(),
            (sender, e) => this.NotifySubscribers());
    }

    PaintsChanged: boolean = false;

    public get ActivePoints(): System.HashSet<LiveChartsCore.ChartPoint> {
        return this.everFetched;
    }

    #SeriesProperties: LiveChartsCore.SeriesProperties = 0;
    public get SeriesProperties() {
        return this.#SeriesProperties;
    }

    private set SeriesProperties(value) {
        this.#SeriesProperties = value;
    }

    public get Name(): Nullable<string> {
        return this._name;
    }

    public set Name(value: Nullable<string>) {
        this.SetProperty(new System.Ref(() => this._name, $v => this._name = $v), value);
    }

    public get Values(): Nullable<System.IEnumerable<TModel>> {
        return this._values;
    }

    public set Values(value: Nullable<System.IEnumerable<TModel>>) {
        this._observer?.Dispose(this._values);
        this._observer?.Initialize(value);
        this._values = value;
        this.OnPropertyChanged();
    }


    public get Pivot(): number {
        return this.pivot;
    }

    public set Pivot(value: number) {
        this.SetProperty(new System.Ref(() => this.pivot, $v => this.pivot = $v), <number><unknown>value);
    }

    public get Mapping(): Nullable<System.Action2<TModel, LiveChartsCore.ChartPoint>> {
        return this._mapping;
    }

    public set Mapping(value: Nullable<System.Action2<TModel, LiveChartsCore.ChartPoint>>) {
        this.SetProperty(new System.Ref(() => this._mapping, $v => this._mapping = $v), value);
    }

    SeriesId: number = -1;

    get RequiresFindClosestOnPointerDown(): boolean {
        return this.DataPointerDown != null || this.ChartPointPointerDown != null;
    }

    public readonly PointMeasured = new System.Event<LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>>();

    public readonly PointCreated = new System.Event<LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>>();

    public readonly DataPointerDown = new System.Event<LiveChartsCore.IChartView, System.IEnumerable<LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>>>();

    public readonly DataPointerHover = new System.Event<LiveChartsCore.IChartView, LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>>();

    public readonly DataPointerHoverLost = new System.Event<LiveChartsCore.IChartView, LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>>();

    public readonly ChartPointPointerHover = new System.Event<LiveChartsCore.IChartView, LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>>();

    public readonly ChartPointPointerHoverLost = new System.Event<LiveChartsCore.IChartView, LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>>();

    public readonly ChartPointPointerDown = new System.Event<LiveChartsCore.IChartView, LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>>();

    public get ZIndex(): number {
        return this._zIndex;
    }

    public set ZIndex(value: number) {
        this.SetProperty(new System.Ref(() => this._zIndex, $v => this._zIndex = $v), value);
    }

    public get TooltipLabelFormatter(): System.Func2<LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>, string> {
        return this._tooltipLabelFormatter;
    }

    public set TooltipLabelFormatter(value: System.Func2<LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>, string>) {
        this.SetProperty(new System.Ref(() => this._tooltipLabelFormatter, $v => this._tooltipLabelFormatter = $v), value);
    }

    public get DataLabelsFormatter(): System.Func2<LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>, string> {
        return this._dataLabelsFormatter;
    }

    public set DataLabelsFormatter(value: System.Func2<LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>, string>) {
        this.SetProperty(new System.Ref(() => this._dataLabelsFormatter, $v => this._dataLabelsFormatter = $v), value);
    }

    public get IsVisible(): boolean {
        return this._isVisible;
    }

    public set IsVisible(value: boolean) {
        this.SetProperty(new System.Ref(() => this._isVisible, $v => this._isVisible = $v), value);
    }

    public IsHoverable: boolean = true;

    public get IsVisibleAtLegend(): boolean {
        return this._isVisibleAtLegend;
    }

    public set IsVisibleAtLegend(value: boolean) {
        this.SetProperty(new System.Ref(() => this._isVisibleAtLegend, $v => this._isVisibleAtLegend = $v), value);
    }

    public get DataPadding(): LiveChartsCore.LvcPoint {
        return this._dataPadding;
    }

    public set DataPadding(value: LiveChartsCore.LvcPoint) {
        this.SetProperty(new System.Ref(() => this._dataPadding, $v => this._dataPadding = $v), (value).Clone());
    }

    public get AnimationsSpeed(): Nullable<System.TimeSpan> {
        return this._animationsSpeed;
    }

    public set AnimationsSpeed(value: Nullable<System.TimeSpan>) {
        this.SetProperty(new System.Ref(() => this._animationsSpeed, $v => this._animationsSpeed = $v), value);
    }

    public get EasingFunction(): Nullable<System.Func2<number, number>> {
        return this._easingFunction;
    }

    public set EasingFunction(value: Nullable<System.Func2<number, number>>) {
        this.SetProperty(new System.Ref(() => this._easingFunction, $v => this._easingFunction = $v), value);
    }

    public get DataFactory(): LiveChartsCore.DataFactory<TModel, TDrawingContext> {
        if (this._dataFactory == null) {
            let factory = LiveChartsCore.LiveCharts.DefaultSettings.GetProvider<TDrawingContext>();
            this._dataFactory = factory.GetDefaultDataFactory<TModel>();
        }

        return this._dataFactory;
    }

    public get LegendShapeSize(): number {
        return this.MiniatureShapeSize;
    }

    public set LegendShapeSize(value: number) {
        this.MiniatureShapeSize = value;
    }

    public get MiniatureShapeSize(): number {
        return this._miniatureShapeSize;
    }

    public set MiniatureShapeSize(value: number) {
        this._miniatureShapeSize = value;
        this.OnMiniatureChanged();
        this.SetProperty(new System.Ref(() => this._miniatureShapeSize, $v => this._miniatureShapeSize = $v), value);
    }

    public get CanvasSchedule(): LiveChartsCore.Sketch<TDrawingContext> {
        return this._miniatureSketch;
    }

    protected set CanvasSchedule(value: LiveChartsCore.Sketch<TDrawingContext>) {
        this.SetProperty(new System.Ref(() => this._miniatureSketch, $v => this._miniatureSketch = $v), value);
    }

    public readonly VisibilityChanged = new System.Event<LiveChartsCore.ISeries>();

    public GetStackGroup(): number {
        return 0;
    }

    public Fetch(chart: LiveChartsCore.IChart): System.IEnumerable<LiveChartsCore.ChartPoint> {
        this.subscribedTo.Add(chart);
        return this.DataFactory.Fetch(this, chart);
    }

    protected OnDataPointerDown(chart: LiveChartsCore.IChartView, points: System.IEnumerable<LiveChartsCore.ChartPoint>, pointer: LiveChartsCore.LvcPoint) {
        this.DataPointerDown.Invoke(chart, points.Select(point => new LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>(point)));
        this.ChartPointPointerDown.Invoke(chart, new LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>(LiveChartsCore.Extensions.FindClosestTo<TModel, TVisual, TLabel>(points, (pointer).Clone())!));
    }

    // IEnumerable<ChartPoint> ISeries.Fetch(IChart chart)
    // {
    //     return Fetch(chart);
    // }

    FindHitPoints(chart: LiveChartsCore.IChart, pointerPosition: LiveChartsCore.LvcPoint, strategy: LiveChartsCore.TooltipFindingStrategy): System.IEnumerable<LiveChartsCore.ChartPoint> {
        let motionCanvas = <LiveChartsCore.MotionCanvas<TDrawingContext>><unknown>chart.Canvas;
        if (motionCanvas.StartPoint != null) {
            pointerPosition.X -= motionCanvas.StartPoint.X;
            pointerPosition.Y -= motionCanvas.StartPoint.Y;
        }

        let query = this.Fetch(chart)
            .Where(x =>
                x.Context.HoverArea != null &&
                x.Context.HoverArea.IsPointerOver((pointerPosition).Clone(), strategy));

        let s = (Math.floor(strategy) & 0xFFFFFFFF);
        if (s >= 4 && s <= 6) {
            // if select closest...
            query = LiveChartsCore.Extensions.SelectFirst(query
                    .Select(x => {
                        return {distance: x.DistanceTo((pointerPosition).Clone()), point: x}
                    })
                    .OrderBy(x => x.distance)
                , x => x.point);
        }

        return query;
    }

    OnPointerEnter(point: LiveChartsCore.ChartPoint) {
        this.WhenPointerEnters(point);
    }

    OnPointerLeft(point: LiveChartsCore.ChartPoint) {
        this.WhenPointerLeaves(point);
    }

    public RestartAnimations() {
        if (this.DataFactory == null) throw new System.Exception("Data provider not found");
        this.DataFactory.RestartVisuals();
    }

    public GetTooltipText(point: LiveChartsCore.ChartPoint): string {
        return this.TooltipLabelFormatter(new LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>(point));
    }

    public GetDataLabelText(point: LiveChartsCore.ChartPoint): string {
        return this.DataLabelsFormatter(new LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>(point));
    }

    public RemoveFromUI(chart: LiveChartsCore.Chart<TDrawingContext>) {
        super.RemoveFromUI(chart);
        this.DataFactory?.Dispose(chart);
        this._dataFactory = null;
        this.everFetched = new System.HashSet<LiveChartsCore.ChartPoint>();
    }

    public ConvertToTypedChartPoint(point: LiveChartsCore.ChartPoint): LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel> {
        return new LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>(point);
    }

    public abstract SoftDeleteOrDispose(chart: LiveChartsCore.IChartView): void;

    public abstract GetMiniatresSketch(): LiveChartsCore.Sketch<TDrawingContext> ;

    protected BuildMiniatureSchedule(paint: LiveChartsCore.IPaint<TDrawingContext>, geometry: LiveChartsCore.ISizedGeometry<TDrawingContext>): LiveChartsCore.PaintSchedule<TDrawingContext> {
        let paintClone = paint.CloneTask();
        let st = paint.IsStroke ? paint.StrokeThickness : 0;

        if (st > Series.MAX_MINIATURE_STROKE_WIDTH) {
            st = Series.MAX_MINIATURE_STROKE_WIDTH;
            paintClone.StrokeThickness = Series.MAX_MINIATURE_STROKE_WIDTH;
        }

        geometry.X = 0.5 * st;
        geometry.Y = 0.5 * st;
        geometry.Height = <number><unknown>this.MiniatureShapeSize;
        geometry.Width = <number><unknown>this.MiniatureShapeSize;

        if (paint.IsStroke) paintClone.ZIndex = 1;

        return new LiveChartsCore.PaintSchedule<TDrawingContext>(paintClone, geometry);
    }

    public OnPointMeasured(chartPoint: LiveChartsCore.ChartPoint) {
        this.PointMeasured.Invoke(new LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>(chartPoint));
    }

    public OnPointCreated(chartPoint: LiveChartsCore.ChartPoint) {
        this.SetDefaultPointTransitions(chartPoint);
        this.PointCreated.Invoke(new LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>(chartPoint));
    }

    protected abstract SetDefaultPointTransitions(chartPoint: LiveChartsCore.ChartPoint): void;

    protected OnVisibilityChanged() {
        this.VisibilityChanged.Invoke(this);
    }

    protected WhenPointerEnters(point: LiveChartsCore.ChartPoint) {
        let chartView = <LiveChartsCore.IChartView1<TDrawingContext>><unknown>point.Context.Chart;

        if (this.hoverPaint == null) {
            let coreChart = <LiveChartsCore.Chart<TDrawingContext>><unknown>chartView.CoreChart;

            this.hoverPaint = LiveChartsCore.LiveCharts.DefaultSettings.GetProvider<TDrawingContext>()
                .GetSolidColorPaint(new LiveChartsCore.LvcColor(255, 255, 255, 100));
            this.hoverPaint.ZIndex = 10049;
            this.hoverPaint.SetClipRectangle(chartView.CoreCanvas, new LiveChartsCore.LvcRectangle((coreChart.DrawMarginLocation).Clone(), (coreChart.DrawMarginSize).Clone()));
        }

        chartView.CoreCanvas.AddDrawableTask(this.hoverPaint);

        let visual = <Nullable<TVisual>><unknown>point.Context.Visual;
        if (visual == null || visual.MainGeometry == null) return;

        this.hoverPaint.AddGeometryToPaintTask(chartView.CoreCanvas, visual.MainGeometry);

        this.DataPointerHover.Invoke(point.Context.Chart, new LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>(point));
        this.ChartPointPointerHover.Invoke(point.Context.Chart, new LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>(point));
    }

    protected WhenPointerLeaves(point: LiveChartsCore.ChartPoint) {
        if (this.hoverPaint == null) return;

        let visual = <Nullable<TVisual>><unknown>point.Context.Visual;
        if (visual == null || visual.MainGeometry == null) return;

        this.hoverPaint.RemoveGeometryFromPainTask(
            <LiveChartsCore.MotionCanvas<TDrawingContext>><unknown>point.Context.Chart.CoreChart.Canvas,
            visual.MainGeometry);

        this.DataPointerHoverLost.Invoke(point.Context.Chart, new LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>(point));
        this.ChartPointPointerHoverLost.Invoke(point.Context.Chart, new LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>(point));
    }

    protected OnPaintChanged(propertyName: Nullable<string>) {
        super.OnPaintChanged(propertyName);
        this.OnMiniatureChanged();
        (<LiveChartsCore.ISeries><unknown>this).PaintsChanged = true;
    }

    protected OnMiniatureChanged() {
        this.CanvasSchedule = this.GetMiniatresSketch();
    }

    private NotifySubscribers() {
        for (const chart of this.subscribedTo) chart.Update();
    }
}
