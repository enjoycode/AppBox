import * as LiveChartsCore from '@/LiveChartsCore'

export type ChartEventHandler<TDrawingContext extends LiveChartsCore.DrawingContext> = (chart: LiveChartsCore.IChartView1<TDrawingContext>) => void;
