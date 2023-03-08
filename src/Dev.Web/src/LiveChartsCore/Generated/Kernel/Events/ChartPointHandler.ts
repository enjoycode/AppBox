import * as LiveChartsCore from '@/LiveChartsCore'

export type ChartPointHandler = (chart: LiveChartsCore.IChartView, point: Nullable<LiveChartsCore.ChartPoint>) => void;

export type ChartPointHandler3<TModel, TVisual, TLabel> = (chart: LiveChartsCore.IChartView, point: Nullable<LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>>) => void;
