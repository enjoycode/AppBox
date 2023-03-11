import * as System from '@/System'
import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as PixUI from '@/PixUI'

export abstract class ChartView extends PixUI.Widget implements PixUI.IMouseRegion, LiveChartsCore.IChartView1<LiveCharts.SkiaDrawingContext> {
    private static readonly $meta_PixUI_IMouseRegion = true;

    protected constructor(tooltip: Nullable<LiveChartsCore.IChartTooltip<LiveCharts.SkiaDrawingContext>>,
                          legend: Nullable<LiveChartsCore.IChartLegend<LiveCharts.SkiaDrawingContext>>) {
        super();
        if (tooltip != null) this.tooltip = tooltip;
        if (legend != null) this.legend = legend;

        if (!LiveChartsCore.LiveCharts.IsConfigured)
            LiveChartsCore.LiveCharts.Configure(config => LiveCharts.LiveChartsSkiaSharp.UseDefaults(config));

        this.InitializeCore();

        this._visualsObserver = new LiveChartsCore.CollectionDeepObserver<LiveChartsCore.ChartElement<LiveCharts.SkiaDrawingContext>>((s, e) => this.OnPropertyChanged(),
            (s, e) => this.OnPropertyChanged(), true);

        if (this.core == null) throw new System.Exception("Core not found!");
        // core.Measuring += OnCoreMeasuring;
        // core.UpdateStarted += OnCoreUpdateStarted;
        // core.UpdateFinished += OnCoreUpdateFinished;

        this.MouseRegion = new PixUI.MouseRegion();
        this.MouseRegion.PointerMove.Add(e => this.core?.InvokePointerMove(new LiveChartsCore.LvcPoint(e.X, e.Y)));
        this.MouseRegion.HoverChanged.Add(hover => {
            if (!hover) this.core?.InvokePointerLeft();
        });
    }


    protected core: Nullable<LiveChartsCore.Chart<LiveCharts.SkiaDrawingContext>>;

    protected legend: Nullable<LiveChartsCore.IChartLegend<LiveCharts.SkiaDrawingContext>> = new LiveCharts.SKDefaultLegend();

    protected tooltip: Nullable<LiveChartsCore.IChartTooltip<LiveCharts.SkiaDrawingContext>> = new LiveCharts.SKDefaultTooltip();

    private _legendPosition: LiveChartsCore.LegendPosition = LiveChartsCore.LiveCharts.DefaultSettings.LegendPosition;
    private _drawMargin: Nullable<LiveChartsCore.Margin> = null;
    private _tooltipPosition: LiveChartsCore.TooltipPosition = LiveChartsCore.LiveCharts.DefaultSettings.TooltipPosition;
    private _title: Nullable<LiveChartsCore.VisualElement<LiveCharts.SkiaDrawingContext>>;
    private readonly _visualsObserver: LiveChartsCore.CollectionDeepObserver<LiveChartsCore.ChartElement<LiveCharts.SkiaDrawingContext>>;

    private _visuals: System.IEnumerable<LiveChartsCore.ChartElement<LiveCharts.SkiaDrawingContext>> = new System.List<LiveChartsCore.ChartElement<LiveCharts.SkiaDrawingContext>>();

    private _legendTextPaint: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>> = <Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>><unknown>LiveChartsCore.LiveCharts.DefaultSettings.LegendTextPaint;

    private _legendBackgroundPaint: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>> = <Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>><unknown>LiveChartsCore.LiveCharts.DefaultSettings.LegendBackgroundPaint;

    private _legendTextSize: Nullable<number> = LiveChartsCore.LiveCharts.DefaultSettings.LegendTextSize;

    private _tooltipTextPaint: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>> = <Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>><unknown>LiveChartsCore.LiveCharts.DefaultSettings.TooltipTextPaint;

    private _tooltipBackgroundPaint: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>> = <Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>><unknown>LiveChartsCore.LiveCharts.DefaultSettings.TooltipBackgroundPaint;

    private _tooltipTextSize: Nullable<number> = LiveChartsCore.LiveCharts.DefaultSettings.TooltipTextSize;


    public get CoreChart(): LiveChartsCore.IChart {
        return this.core!;
    }

    public get DesignerMode(): boolean {
        return false;
    }

    public BackColor: LiveChartsCore.LvcColor = new LiveChartsCore.LvcColor(255, 255, 255);

    public get ControlSize(): LiveChartsCore.LvcSize {
        // return the full control size as a workaround when the legend is not set.
        // for some reason WinForms has not loaded the correct size at this point when the control loads.
        return this.LegendPosition == LiveChartsCore.LegendPosition.Hidden
            ? new LiveChartsCore.LvcSize().Init({Width: this.W, Height: this.H})
            : new LiveChartsCore.LvcSize().Init({Width: this.W, Height: this.H});
    }

    public get DrawMargin(): Nullable<LiveChartsCore.Margin> {
        return this._drawMargin;
    }

    public set DrawMargin(value: Nullable<LiveChartsCore.Margin>) {
        this._drawMargin = value;
        this.OnPropertyChanged();
    }

    public AnimationsSpeed: System.TimeSpan = LiveChartsCore.LiveCharts.DefaultSettings.AnimationsSpeed;

    public EasingFunction: Nullable<System.Func2<number, number>> = LiveChartsCore.LiveCharts.DefaultSettings.EasingFunction;

    public UpdaterThrottler: System.TimeSpan = LiveChartsCore.LiveCharts.DefaultSettings.UpdateThrottlingTimeout;

    public get LegendPosition(): LiveChartsCore.LegendPosition {
        return this._legendPosition;
    }

    public set LegendPosition(value: LiveChartsCore.LegendPosition) {
        this._legendPosition = value;
        this.OnPropertyChanged();
    }

    public get TooltipPosition(): LiveChartsCore.TooltipPosition {
        return this._tooltipPosition;
    }

    public set TooltipPosition(value: LiveChartsCore.TooltipPosition) {
        this._tooltipPosition = value;
        this.OnPropertyChanged();
    }

    public readonly DataPointerDown = new System.Event<LiveChartsCore.IChartView, System.IEnumerable<LiveChartsCore.ChartPoint>>();
    public readonly ChartPointPointerDown = new System.Event<LiveChartsCore.IChartView, LiveChartsCore.ChartPoint>();

    public OnDataPointerDown(points: System.IEnumerable<LiveChartsCore.ChartPoint>, pointer: LiveChartsCore.LvcPoint) {
        throw new System.NotImplementedException();
    }

    // public object SyncContext
    // {
    //     get => CoreCanvas.Sync;
    //     // set
    //     // {
    //     //     CoreCanvas.Sync = value;
    //     //     OnPropertyChanged();
    //     // }
    // }

    public InvokeOnUIThread(action: System.Action) {
        if (!this.IsMounted) return;

        PixUI.UIApplication.Current.BeginInvoke(action);
    }

    // void IChartView.Invalidate() //TODO: rename IChartView.Invalidate()
    //     => CoreCanvas.Invalidate();

    public get LegendTextPaint(): Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>> {
        return this._legendTextPaint;
    }

    public set LegendTextPaint(value: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>) {
        this._legendTextPaint = value;
        this.OnPropertyChanged();
    }

    public get LegendBackgroundPaint(): Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>> {
        return this._legendBackgroundPaint;
    }

    public set LegendBackgroundPaint(value: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>) {
        this._legendBackgroundPaint = value;
        this.OnPropertyChanged();
    }

    public get LegendTextSize(): Nullable<number> {
        return this._legendTextSize;
    }

    public set LegendTextSize(value: Nullable<number>) {
        this._legendTextSize = value;
        this.OnPropertyChanged();
    }

    public get TooltipTextPaint(): Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>> {
        return this._tooltipTextPaint;
    }

    public set TooltipTextPaint(value: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>) {
        this._tooltipTextPaint = value;
        this.OnPropertyChanged();
    }

    public get TooltipBackgroundPaint(): Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>> {
        return this._tooltipBackgroundPaint;
    }

    public set TooltipBackgroundPaint(value: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>) {
        this._tooltipBackgroundPaint = value;
        this.OnPropertyChanged();
    }

    public get TooltipTextSize(): Nullable<number> {
        return this._tooltipTextSize;
    }

    public set TooltipTextSize(value: Nullable<number>) {
        this._tooltipTextSize = value;
        this.OnPropertyChanged();
    }

    public get Title(): Nullable<LiveChartsCore.VisualElement<LiveCharts.SkiaDrawingContext>> {
        return this._title;
    }

    public set Title(value: Nullable<LiveChartsCore.VisualElement<LiveCharts.SkiaDrawingContext>>) {
        this._title = value;
        this.OnPropertyChanged();
    }

    public readonly Measuring = new System.Event<LiveChartsCore.IChartView1<LiveCharts.SkiaDrawingContext>>();
    public readonly UpdateStarted = new System.Event<LiveChartsCore.IChartView1<LiveCharts.SkiaDrawingContext>>();
    public readonly UpdateFinished = new System.Event<LiveChartsCore.IChartView1<LiveCharts.SkiaDrawingContext>>();
    public readonly VisualElementsPointerDown = new System.Event<LiveChartsCore.IChartView, LiveChartsCore.VisualElementsEventArgs<LiveCharts.SkiaDrawingContext>>();

    public AutoUpdateEnabled: boolean = true;

    public get CoreCanvas(): LiveChartsCore.MotionCanvas<LiveCharts.SkiaDrawingContext> {
        return this.CanvasCore;
    }

    public get Legend(): Nullable<LiveChartsCore.IChartLegend<LiveCharts.SkiaDrawingContext>> {
        return this.legend;
    }

    public set Legend(value: Nullable<LiveChartsCore.IChartLegend<LiveCharts.SkiaDrawingContext>>) {
        this.legend = value;
    }

    public get Tooltip(): Nullable<LiveChartsCore.IChartTooltip<LiveCharts.SkiaDrawingContext>> {
        return this.tooltip;
    }

    public set Tooltip(value: Nullable<LiveChartsCore.IChartTooltip<LiveCharts.SkiaDrawingContext>>) {
        this.tooltip = value;
    }

    public get VisualElements(): System.IEnumerable<LiveChartsCore.ChartElement<LiveCharts.SkiaDrawingContext>> {
        return this._visuals;
    }

    public set VisualElements(value: System.IEnumerable<LiveChartsCore.ChartElement<LiveCharts.SkiaDrawingContext>>) {
        this._visualsObserver?.Dispose(this._visuals);
        this._visualsObserver?.Initialize(value);
        this._visuals = value;
        this.OnPropertyChanged();
    }

    public ShowTooltip(points: System.IEnumerable<LiveChartsCore.ChartPoint>) {
        if (this.tooltip == null || this.core == null) return;

        this.tooltip.Show(points, this.core);
    }

    public HideTooltip() {
        if (this.tooltip == null || this.core == null) return;

        this.core.ClearTooltipData();
        this.tooltip.Hide();
    }

    public OnVisualElementPointerDown(visualElements: System.IEnumerable<LiveChartsCore.VisualElement<LiveCharts.SkiaDrawingContext>>,
                                      pointer: LiveChartsCore.LvcPoint) {
        throw new System.NotImplementedException();
    }

    public abstract GetPointsAt(point: LiveChartsCore.LvcPoint,
                                strategy?: LiveChartsCore.TooltipFindingStrategy): System.IEnumerable<LiveChartsCore.ChartPoint> ;

    public abstract GetVisualsAt(point: LiveChartsCore.LvcPoint): System.IEnumerable<LiveChartsCore.VisualElement<LiveCharts.SkiaDrawingContext>> ;


    private _isDrawingLoopRunning: boolean = false;
    private _paintTasksSchedule: System.List<LiveChartsCore.PaintSchedule<LiveCharts.SkiaDrawingContext>> = new System.List();

    public get PaintTasks(): System.List<LiveChartsCore.PaintSchedule<LiveCharts.SkiaDrawingContext>> {
        return this._paintTasksSchedule;
    }

    public set PaintTasks(value: System.List<LiveChartsCore.PaintSchedule<LiveCharts.SkiaDrawingContext>>) {
        this._paintTasksSchedule = value;
        this.OnPaintTasksChanged();
    }

    public MaxFps: number = 65;

    #CanvasCore: LiveChartsCore.MotionCanvas<LiveCharts.SkiaDrawingContext> = new LiveChartsCore.MotionCanvas();
    public get CanvasCore() {
        return this.#CanvasCore;
    }

    private set CanvasCore(value) {
        this.#CanvasCore = value;
    }

    private CanvasCore_Invalidated(sender: LiveChartsCore.MotionCanvas<LiveCharts.SkiaDrawingContext>) {
        this.RunDrawingLoop();
    }

    private async RunDrawingLoop() {
        if (this._isDrawingLoopRunning) return;
        this._isDrawingLoopRunning = true;

        let ts = System.TimeSpan.FromSeconds(1 / this.MaxFps);
        while (!this.CanvasCore.IsValid) {
            this.Invalidate(PixUI.InvalidAction.Repaint);
            await new Promise<void>($resolve => setTimeout(() => $resolve(), (Math.floor(ts.TotalMilliseconds) & 0xFFFFFFFF)));
        }

        this._isDrawingLoopRunning = false;
    }

    private OnPaintTasksChanged() {
        let tasks = new System.HashSet<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>();

        for (const item of this._paintTasksSchedule) {
            item.PaintTask.SetGeometries(this.CanvasCore, item.Geometries);
            tasks.Add(item.PaintTask);
        }

        this.CanvasCore.SetPaintTasks(tasks);
    }


    #MouseRegion: PixUI.MouseRegion;
    public get MouseRegion() {
        return this.#MouseRegion;
    }

    private set MouseRegion(value) {
        this.#MouseRegion = value;
    }

    OnMounted() {
        super.OnMounted();
        this.core?.Load();

        this.CanvasCore.Invalidated.Add(this.CanvasCore_Invalidated, this);
    }

    OnUnmounted() {
        super.OnUnmounted();

        this.CanvasCore.Invalidated.Remove(this.CanvasCore_Invalidated, this);
        this.CanvasCore.Dispose();

        if (System.IsInterfaceOfIDisposable(this.tooltip)) {
            const disposableTooltip = this.tooltip;
            disposableTooltip.Dispose();
        }
        this.core?.Unload();
        this.OnUnloading();
    }

    Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        this.SetSize(width, height);
    }

    Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        canvas.save();
        canvas.clipRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), CanvasKit.ClipOp.Intersect, false);

        //TODO: cache SkiaSharpDrawingContext instance
        let drawCtx = new LiveCharts.SkiaDrawingContext(this.CanvasCore, (Math.floor(this.W) & 0xFFFFFFFF), (Math.floor(this.H) & 0xFFFFFFFF), canvas);
        drawCtx.Background = LiveCharts.LiveChartsSkiaSharp.AsSKColor(this.BackColor);
        this.CanvasCore.DrawFrame(drawCtx);

        canvas.restore();
    }


    protected abstract InitializeCore(): void;

    protected OnUnloading() {
    }

    protected OnPropertyChanged() {
        if (this.core == null || (<LiveChartsCore.IChartView><unknown>this).DesignerMode) return;
        this.core.Update();
    }
}