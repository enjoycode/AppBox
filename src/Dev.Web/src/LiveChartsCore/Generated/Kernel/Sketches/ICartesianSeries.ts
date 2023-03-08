import * as LiveChartsCore from '@/LiveChartsCore'

export interface ICartesianSeries<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IChartSeries<TDrawingContext> {
    get ScalesXAt(): number;

    set ScalesXAt(value: number);

    get ScalesYAt(): number;

    set ScalesYAt(value: number);

    get DataLabelsPosition(): LiveChartsCore.DataLabelsPosition;

    set DataLabelsPosition(value: LiveChartsCore.DataLabelsPosition);

    get DataLabelsTranslate(): Nullable<LiveChartsCore.LvcPoint>;

    set DataLabelsTranslate(value: Nullable<LiveChartsCore.LvcPoint>);

    GetBounds(chart: LiveChartsCore.CartesianChart<TDrawingContext>, x: LiveChartsCore.ICartesianAxis, y: LiveChartsCore.ICartesianAxis): LiveChartsCore.SeriesBounds;
}
