import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export interface IChartView {
    get CoreChart(): LiveChartsCore.IChart;


    get DesignerMode(): boolean;


    get BackColor(): LiveChartsCore.LvcColor;

    set BackColor(value: LiveChartsCore.LvcColor);

    get ControlSize(): LiveChartsCore.LvcSize;


    get DrawMargin(): Nullable<LiveChartsCore.Margin>;

    set DrawMargin(value: Nullable<LiveChartsCore.Margin>);

    get AnimationsSpeed(): System.TimeSpan;

    set AnimationsSpeed(value: System.TimeSpan);

    get EasingFunction(): Nullable<System.Func2<number, number>>;

    set EasingFunction(value: Nullable<System.Func2<number, number>>);

    get UpdaterThrottler(): System.TimeSpan;

    set UpdaterThrottler(value: System.TimeSpan);

    get LegendPosition(): LiveChartsCore.LegendPosition;

    set LegendPosition(value: LiveChartsCore.LegendPosition);

    get TooltipPosition(): LiveChartsCore.TooltipPosition;

    set TooltipPosition(value: LiveChartsCore.TooltipPosition);


    OnDataPointerDown(points: System.IEnumerable<LiveChartsCore.ChartPoint>, pointer: LiveChartsCore.LvcPoint): void;

    // /// <summary>
    // /// Gets or sets the Synchronization Context, use this property to
    // /// use an external object to handle multi threading synchronization.
    // /// </summary>
    // object SyncContext { get; /*set;*/ }

    InvokeOnUIThread(action: System.Action): void;

    // /// <summary>
    // /// Invalidates the control.
    // /// </summary>
    // void Invalidate();
}

export interface IChartView1<TDrawingContext extends LiveChartsCore.DrawingContext> extends IChartView {
    get LegendTextPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set LegendTextPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get LegendBackgroundPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set LegendBackgroundPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get LegendTextSize(): Nullable<number>;

    set LegendTextSize(value: Nullable<number>);

    get TooltipTextPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set TooltipTextPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get TooltipBackgroundPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set TooltipBackgroundPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get TooltipTextSize(): Nullable<number>;

    set TooltipTextSize(value: Nullable<number>);

    get Title(): Nullable<LiveChartsCore.VisualElement<TDrawingContext>>;

    set Title(value: Nullable<LiveChartsCore.VisualElement<TDrawingContext>>);


    get AutoUpdateEnabled(): boolean;

    set AutoUpdateEnabled(value: boolean);

    get CoreCanvas(): LiveChartsCore.MotionCanvas<TDrawingContext>;


    get Legend(): Nullable<LiveChartsCore.IChartLegend<TDrawingContext>>;

    set Legend(value: Nullable<LiveChartsCore.IChartLegend<TDrawingContext>>);

    get Tooltip(): Nullable<LiveChartsCore.IChartTooltip<TDrawingContext>>;

    set Tooltip(value: Nullable<LiveChartsCore.IChartTooltip<TDrawingContext>>);

    get VisualElements(): System.IEnumerable<LiveChartsCore.ChartElement<TDrawingContext>>;

    set VisualElements(value: System.IEnumerable<LiveChartsCore.ChartElement<TDrawingContext>>);

    ShowTooltip(points: System.IEnumerable<LiveChartsCore.ChartPoint>): void;

    HideTooltip(): void;

    OnVisualElementPointerDown(visualElements: System.IEnumerable<LiveChartsCore.VisualElement<TDrawingContext>>, pointer: LiveChartsCore.LvcPoint): void;

    GetPointsAt(point: LiveChartsCore.LvcPoint, strategy?: LiveChartsCore.TooltipFindingStrategy): System.IEnumerable<LiveChartsCore.ChartPoint>;

    GetVisualsAt(point: LiveChartsCore.LvcPoint): System.IEnumerable<LiveChartsCore.VisualElement<TDrawingContext>>;
}
