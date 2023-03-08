import * as LiveChartsCore from '@/LiveChartsCore'

export interface ILineSeries<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IChartSeries<TDrawingContext>, LiveChartsCore.IStrokedAndFilled<TDrawingContext>, LiveChartsCore.ICartesianSeries<TDrawingContext> {
    get GeometrySize(): number;

    set GeometrySize(value: number);

    get LineSmoothness(): number;

    set LineSmoothness(value: number);

    get EnableNullSplitting(): boolean;

    set EnableNullSplitting(value: boolean);

    get GeometryFill(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set GeometryFill(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get GeometryStroke(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set GeometryStroke(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);
}
