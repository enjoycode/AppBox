import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export interface IChartSeries<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.ISeries, LiveChartsCore.IChartElement<TDrawingContext> {
    get DataLabelsPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set DataLabelsPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get DataLabelsSize(): number;

    set DataLabelsSize(value: number);

    get DataLabelsRotation(): number;

    set DataLabelsRotation(value: number);

    get DataLabelsPadding(): LiveChartsCore.Padding;

    set DataLabelsPadding(value: LiveChartsCore.Padding);

    get CanvasSchedule(): LiveChartsCore.Sketch<TDrawingContext>;


    get IsFirstDraw(): boolean;


    GetStackGroup(): number;

    MiniatureEquals(instance: IChartSeries<TDrawingContext>): boolean;

    GetMiniatresSketch(): LiveChartsCore.Sketch<TDrawingContext>;

    OnDataPointerDown(chart: LiveChartsCore.IChartView, points: System.IEnumerable<LiveChartsCore.ChartPoint>, pointerLocation: LiveChartsCore.LvcPoint): void;
}
