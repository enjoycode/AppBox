import * as LiveChartsCore from '@/LiveChartsCore'

export interface IHeatSeries<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.ICartesianSeries<TDrawingContext> {
    get HeatMap(): LiveChartsCore.LvcColor[];

    set HeatMap(value: LiveChartsCore.LvcColor[]);

    get ColorStops(): Nullable<Float64Array>;

    set ColorStops(value: Nullable<Float64Array>);

    get PointPadding(): LiveChartsCore.Padding;

    set PointPadding(value: LiveChartsCore.Padding);
}
