import * as LiveChartsCore from '@/LiveChartsCore'

export interface IChartLegend<TDrawingContext extends LiveChartsCore.DrawingContext> {
    Draw(chart: LiveChartsCore.Chart<TDrawingContext>): void;
}
