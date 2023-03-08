import * as LiveChartsCore from '@/LiveChartsCore'

export interface IPolarSeries<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IChartSeries<TDrawingContext> {
    get ScalesAngleAt(): number;

    set ScalesAngleAt(value: number);

    get ScalesRadiusAt(): number;

    set ScalesRadiusAt(value: number);

    get DataLabelsPosition(): LiveChartsCore.PolarLabelsPosition;

    set DataLabelsPosition(value: LiveChartsCore.PolarLabelsPosition);

    GetBounds(chart: LiveChartsCore.PolarChart<TDrawingContext>, angleAxis: LiveChartsCore.IPolarAxis, radiusAxis: LiveChartsCore.IPolarAxis): LiveChartsCore.SeriesBounds;
}
