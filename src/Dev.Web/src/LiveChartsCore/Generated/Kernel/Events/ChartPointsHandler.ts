import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export type ChartPointsHandler = (chart: LiveChartsCore.IChartView, points: System.IEnumerable<LiveChartsCore.ChartPoint>) => void;

export type ChartPointsHandler3<TModel, TVisual, TLabel> = (chart: LiveChartsCore.IChartView, points: System.IEnumerable<LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>>) => void;
