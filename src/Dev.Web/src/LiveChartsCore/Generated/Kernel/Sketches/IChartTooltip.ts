import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export interface IChartTooltip<TDrawingContext extends LiveChartsCore.DrawingContext> {
    Show(foundPoints: System.IEnumerable<LiveChartsCore.ChartPoint>, chart: LiveChartsCore.Chart<TDrawingContext>): void;

    Hide(): void;
}
