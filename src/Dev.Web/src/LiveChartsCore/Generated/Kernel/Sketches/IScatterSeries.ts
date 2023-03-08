import * as LiveChartsCore from '@/LiveChartsCore'

export interface IScatterSeries<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IChartSeries<TDrawingContext>, LiveChartsCore.IStrokedAndFilled<TDrawingContext>, LiveChartsCore.ICartesianSeries<TDrawingContext> {
    get GeometrySize(): number;

    set GeometrySize(value: number);

    get MinGeometrySize(): number;

    set MinGeometrySize(value: number);
}
