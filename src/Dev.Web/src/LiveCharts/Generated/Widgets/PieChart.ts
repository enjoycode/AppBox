import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as LiveCharts from '@/LiveCharts'

export class PieChart extends LiveCharts.ChartView implements LiveChartsCore.IPieChartView<LiveCharts.SkiaDrawingContext> {
    public constructor(tooltip: Nullable<LiveChartsCore.IChartTooltip<LiveCharts.SkiaDrawingContext>> = null,
                       legend: Nullable<LiveChartsCore.IChartLegend<LiveCharts.SkiaDrawingContext>> = null) {
        super(tooltip, legend);
        this._seriesObserver = new LiveChartsCore.CollectionDeepObserver<LiveChartsCore.ISeries>((s, e) => this.OnPropertyChanged(),
            (s, e) => this.OnPropertyChanged(),
            true);

        this.Series = new System.ObservableCollection<LiveChartsCore.ISeries>();
        this.VisualElements = new System.ObservableCollection<LiveChartsCore.ChartElement<LiveCharts.SkiaDrawingContext>>();

        // var c = Controls[0].Controls[0];
        // c.MouseDown += OnMouseDown;
    }


    private readonly _seriesObserver: LiveChartsCore.CollectionDeepObserver<LiveChartsCore.ISeries>;
    private _series: System.IEnumerable<LiveChartsCore.ISeries> = new System.List<LiveChartsCore.ISeries>();
    private _isClockwise: boolean = true;
    private _initialRotation: number = 0;
    private _maxAngle: number = 360;
    private _total: Nullable<number>;


    InitializeCore() {
        this.core = new LiveChartsCore.PieChart<LiveCharts.SkiaDrawingContext>(this, config => LiveCharts.LiveChartsSkiaSharp.UseDefaults(config,), this.CanvasCore, true);
        if (this.DesignerMode) return;
        this.core.Update();
    }

    GetPointsAt(point: LiveChartsCore.LvcPoint,
                strategy: LiveChartsCore.TooltipFindingStrategy = LiveChartsCore.TooltipFindingStrategy.Automatic): System.IEnumerable<LiveChartsCore.ChartPoint> {
        let cc = <LiveChartsCore.PieChart<LiveCharts.SkiaDrawingContext>><unknown>this.core;

        if (strategy == LiveChartsCore.TooltipFindingStrategy.Automatic)
            strategy = LiveChartsCore.Extensions.GetTooltipFindingStrategy(cc.Series,);

        return cc.Series.SelectMany(series => series.FindHitPoints(cc, (point).Clone(), strategy));
    }

    GetVisualsAt(point: LiveChartsCore.LvcPoint): System.IEnumerable<LiveChartsCore.VisualElement<LiveCharts.SkiaDrawingContext>> {
        let cc = <LiveChartsCore.PieChart<LiveCharts.SkiaDrawingContext>><unknown>this.core;
        return cc.VisualElements.SelectMany(visual =>
            (<LiveChartsCore.VisualElement<LiveCharts.SkiaDrawingContext>><unknown>visual).IsHitBy(this.core, (point).Clone()));
    }


    public get Core(): LiveChartsCore.PieChart<LiveCharts.SkiaDrawingContext> {
        return <LiveChartsCore.PieChart<LiveCharts.SkiaDrawingContext>><unknown>this.core!;
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

    public get InitialRotation(): number {
        return this._initialRotation;
    }

    public set InitialRotation(value: number) {
        this._initialRotation = value;
        this.OnPropertyChanged();
    }

    public get MaxAngle(): number {
        return this._maxAngle;
    }

    public set MaxAngle(value: number) {
        this._maxAngle = value;
        this.OnPropertyChanged();
    }

    public get Total(): Nullable<number> {
        return this._total;
    }

    public set Total(value: Nullable<number>) {
        this._total = value;
        this.OnPropertyChanged();
    }

    public get IsClockwise(): boolean {
        return this._isClockwise;
    }

    public set IsClockwise(value: boolean) {
        this._isClockwise = value;
        this.OnPropertyChanged();
    }

}