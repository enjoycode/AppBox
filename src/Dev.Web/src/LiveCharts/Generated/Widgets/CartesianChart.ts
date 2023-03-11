import * as PixUI from '@/PixUI'
import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as LiveCharts from '@/LiveCharts'

export class CartesianChart extends LiveCharts.ChartView implements LiveChartsCore.ICartesianChartView<LiveCharts.SkiaDrawingContext> {
    private static readonly $meta_LiveChartsCore_ICartesianChartView = true;

    public constructor(tooltip: Nullable<LiveChartsCore.IChartTooltip<LiveCharts.SkiaDrawingContext>> = null,
                       legend: Nullable<LiveChartsCore.IChartLegend<LiveCharts.SkiaDrawingContext>> = null) {
        super(tooltip, legend);
        this._seriesObserver =
            new LiveChartsCore.CollectionDeepObserver<LiveChartsCore.ISeries>(this.OnDeepCollectionChanged.bind(this), this.OnDeepCollectionPropertyChanged.bind(this), true);
        this._xObserver =
            new LiveChartsCore.CollectionDeepObserver<LiveChartsCore.ICartesianAxis>(this.OnDeepCollectionChanged.bind(this), this.OnDeepCollectionPropertyChanged.bind(this),
                true);
        this._yObserver =
            new LiveChartsCore.CollectionDeepObserver<LiveChartsCore.ICartesianAxis>(this.OnDeepCollectionChanged.bind(this), this.OnDeepCollectionPropertyChanged.bind(this),
                true);
        this._sectionsObserver = new LiveChartsCore.CollectionDeepObserver<LiveChartsCore.Section<LiveCharts.SkiaDrawingContext>>(this.OnDeepCollectionChanged.bind(this), this.OnDeepCollectionPropertyChanged.bind(this), true);

        this.XAxes = new System.List<LiveChartsCore.ICartesianAxis>().Init(
            [
                //LiveCharts.DefaultSettings.GetProvider<SkiaSharpDrawingContext>().GetDefaultCartesianAxis()
                //LiveCharts.DefaultSettings.GetProvider<SkiaSharpDrawingContext>().GetDefaultCartesianAxis()
                new LiveCharts.Axis()
            ]);
        this.YAxes = new System.List<LiveChartsCore.ICartesianAxis>().Init(
            [
                //LiveCharts.DefaultSettings.GetProvider<SkiaSharpDrawingContext>().GetDefaultCartesianAxis()
                //LiveCharts.DefaultSettings.GetProvider<SkiaSharpDrawingContext>().GetDefaultCartesianAxis()
                new LiveCharts.Axis()
            ]);
        this.Series = new System.ObservableCollection<LiveChartsCore.ISeries>();
        this.VisualElements = new System.ObservableCollection<LiveChartsCore.ChartElement<LiveCharts.SkiaDrawingContext>>();

        // var c = Controls[0].Controls[0];
        // c.MouseDown += OnMouseDown;
        // c.MouseWheel += OnMouseWheel;
        // c.MouseUp += OnMouseUp;
    }


    private readonly _seriesObserver: LiveChartsCore.CollectionDeepObserver<LiveChartsCore.ISeries>;
    private readonly _xObserver: LiveChartsCore.CollectionDeepObserver<LiveChartsCore.ICartesianAxis>;
    private readonly _yObserver: LiveChartsCore.CollectionDeepObserver<LiveChartsCore.ICartesianAxis>;
    private readonly _sectionsObserver: LiveChartsCore.CollectionDeepObserver<LiveChartsCore.Section<LiveCharts.SkiaDrawingContext>>;
    private _series: System.IEnumerable<LiveChartsCore.ISeries> = new System.List<LiveChartsCore.ISeries>();
    private _xAxes: System.IEnumerable<LiveChartsCore.ICartesianAxis> = new System.List<LiveCharts.Axis>().Init([new LiveCharts.Axis()]);
    private _yAxes: System.IEnumerable<LiveChartsCore.ICartesianAxis> = new System.List<LiveCharts.Axis>().Init([new LiveCharts.Axis()]);
    private _sections: System.IEnumerable<LiveChartsCore.Section<LiveCharts.SkiaDrawingContext>> = new System.List<LiveChartsCore.Section<LiveCharts.SkiaDrawingContext>>();
    private _drawMarginFrame: Nullable<LiveChartsCore.DrawMarginFrame<LiveCharts.SkiaDrawingContext>>;
    private _tooltipFindingStrategy: LiveChartsCore.TooltipFindingStrategy = LiveChartsCore.LiveCharts.DefaultSettings.TooltipFindingStrategy;


    InitializeCore() {
        let zoomingSection = new LiveCharts.RectangleGeometry();
        let zoomingSectionPaint = new LiveCharts.SolidColorPaint().Init(
            {
                IsFill: true,
                Color: new PixUI.Color(33, 150, 243, 50),
                ZIndex: 2147483647
            });
        zoomingSectionPaint.AddGeometryToPaintTask(this.CanvasCore, zoomingSection);
        this.CanvasCore.AddDrawableTask(zoomingSectionPaint);

        this.core = new LiveChartsCore.CartesianChart<LiveCharts.SkiaDrawingContext>(this, config => LiveCharts.LiveChartsSkiaSharp.UseDefaults(config), this.CanvasCore, zoomingSection);
        if ((<LiveChartsCore.IChartView><unknown>this).DesignerMode) return;
        this.core.Update();
    }

    GetPointsAt(point: LiveChartsCore.LvcPoint,
                strategy: LiveChartsCore.TooltipFindingStrategy = LiveChartsCore.TooltipFindingStrategy.Automatic): System.IEnumerable<LiveChartsCore.ChartPoint> {
        let cc = <LiveChartsCore.CartesianChart<LiveCharts.SkiaDrawingContext>><unknown>this.core;

        if (strategy == LiveChartsCore.TooltipFindingStrategy.Automatic)
            strategy = LiveChartsCore.Extensions.GetTooltipFindingStrategy(cc.Series);

        return cc.Series.SelectMany(series => series.FindHitPoints(cc, (point).Clone(), strategy));
    }

    GetVisualsAt(point: LiveChartsCore.LvcPoint): System.IEnumerable<LiveChartsCore.VisualElement<LiveCharts.SkiaDrawingContext>> {
        let cc = <LiveChartsCore.CartesianChart<LiveCharts.SkiaDrawingContext>><unknown>this.core;
        return cc.VisualElements.SelectMany(visual =>
            (<LiveChartsCore.VisualElement<LiveCharts.SkiaDrawingContext>><unknown>visual).IsHitBy(this.core, (point).Clone()));
    }


    public get Core(): LiveChartsCore.CartesianChart<LiveCharts.SkiaDrawingContext> {
        return <LiveChartsCore.CartesianChart<LiveCharts.SkiaDrawingContext>><unknown>this.core!;
    }

    public get XAxes(): System.IEnumerable<LiveChartsCore.ICartesianAxis> {
        return this._xAxes;
    }

    public set XAxes(value: System.IEnumerable<LiveChartsCore.ICartesianAxis>) {
        this._xObserver?.Dispose(this._xAxes);
        this._xObserver?.Initialize(value);
        this._xAxes = value;
        this.OnPropertyChanged();
    }

    public get YAxes(): System.IEnumerable<LiveChartsCore.ICartesianAxis> {
        return this._yAxes;
    }

    public set YAxes(value: System.IEnumerable<LiveChartsCore.ICartesianAxis>) {
        this._yObserver?.Dispose(this._yAxes);
        this._yObserver?.Initialize(value);
        this._yAxes = value;
        this.OnPropertyChanged();
    }

    public get Sections(): System.IEnumerable<LiveChartsCore.Section<LiveCharts.SkiaDrawingContext>> {
        return this._sections;
    }

    public set Sections(value: System.IEnumerable<LiveChartsCore.Section<LiveCharts.SkiaDrawingContext>>) {
        this._sectionsObserver?.Dispose(this._sections);
        this._sectionsObserver?.Initialize(value);
        this._sections = value;
        this.OnPropertyChanged();
    }

    public get Series(): System.IEnumerable<LiveChartsCore.ISeries> {
        return this._series;
    }

    public set Series(value: System.IEnumerable<LiveChartsCore.ISeries>) {
        this._seriesObserver?.Dispose(this._series);
        this._seriesObserver?.Initialize(value);
        this._series = value;
        this.OnPropertyChanged();
    }

    public get DrawMarginFrame(): Nullable<LiveChartsCore.DrawMarginFrame<LiveCharts.SkiaDrawingContext>> {
        return this._drawMarginFrame;
    }

    public set DrawMarginFrame(value: Nullable<LiveChartsCore.DrawMarginFrame<LiveCharts.SkiaDrawingContext>>) {
        this._drawMarginFrame = value;
        this.OnPropertyChanged();
    }

    public get TooltipFindingStrategy(): LiveChartsCore.TooltipFindingStrategy {
        return this._tooltipFindingStrategy;
    }

    public set TooltipFindingStrategy(value: LiveChartsCore.TooltipFindingStrategy) {
        this._tooltipFindingStrategy = value;
        this.OnPropertyChanged();
    }

    public ZoomMode: LiveChartsCore.ZoomAndPanMode = LiveChartsCore.LiveCharts.DefaultSettings.ZoomMode;

    public ZoomingSpeed: number = LiveChartsCore.LiveCharts.DefaultSettings.ZoomSpeed;

    public ScalePixelsToData(point: LiveChartsCore.LvcPointD, xAxisIndex: number = 0, yAxisIndex: number = 0): LiveChartsCore.LvcPointD {
        let cc = <LiveChartsCore.CartesianChart<LiveCharts.SkiaDrawingContext>><unknown>this.core;
        let xScaler = LiveChartsCore.Scaler.Make((cc.DrawMarginLocation).Clone(), (cc.DrawMarginSize).Clone(), cc.XAxes[xAxisIndex]);
        let yScaler = LiveChartsCore.Scaler.Make((cc.DrawMarginLocation).Clone(), (cc.DrawMarginSize).Clone(), cc.YAxes[yAxisIndex]);

        return new LiveChartsCore.LvcPointD(xScaler.ToChartValues(point.X), yScaler.ToChartValues(point.Y));
    }

    public ScaleDataToPixels(point: LiveChartsCore.LvcPointD, xAxisIndex: number = 0, yAxisIndex: number = 0): LiveChartsCore.LvcPointD {
        let cc = <LiveChartsCore.CartesianChart<LiveCharts.SkiaDrawingContext>><unknown>this.core;

        let xScaler = LiveChartsCore.Scaler.Make((cc.DrawMarginLocation).Clone(), (cc.DrawMarginSize).Clone(), cc.XAxes[xAxisIndex]);
        let yScaler = LiveChartsCore.Scaler.Make((cc.DrawMarginLocation).Clone(), (cc.DrawMarginSize).Clone(), cc.YAxes[yAxisIndex]);

        return new LiveChartsCore.LvcPointD(xScaler.ToPixels(point.X), yScaler.ToPixels(point.Y));
    }


    private OnDeepCollectionChanged(sender: any, e: System.NotifyCollectionChangedEventArgs) {
        this.OnPropertyChanged();
    }

    private OnDeepCollectionPropertyChanged(sender: any, e: System.PropertyChangedEventArgs) {
        this.OnPropertyChanged();
    }
}