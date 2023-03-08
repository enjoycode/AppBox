import * as LiveChartsCore from '@/LiveChartsCore'

export interface IStepLineSeries<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IChartSeries<TDrawingContext>, LiveChartsCore.IStrokedAndFilled<TDrawingContext>, LiveChartsCore.ICartesianSeries<TDrawingContext> {
    get EnableNullSplitting(): boolean;

    set EnableNullSplitting(value: boolean);

    get GeometrySize(): number;

    set GeometrySize(value: number);

    get GeometryFill(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set GeometryFill(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get GeometryStroke(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set GeometryStroke(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);
}
