import * as LiveChartsCore from '@/LiveChartsCore'

export interface IChart {
    get MeasureWork(): any;


    get View(): LiveChartsCore.IChartView;


    get Canvas(): any;


    get LegendPosition(): LiveChartsCore.LegendPosition;


    get TooltipPosition(): LiveChartsCore.TooltipPosition;


    get TooltipFindingStrategy(): LiveChartsCore.TooltipFindingStrategy;


    Update(chartUpdateParams?: Nullable<LiveChartsCore.ChartUpdateParams>): void;
}
