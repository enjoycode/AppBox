import * as LiveChartsCore from '@/LiveChartsCore'

export type VisualElementHandler<TDrawingContext extends LiveChartsCore.DrawingContext> = (chart: LiveChartsCore.IChartView,
                                                                                           visualElementsArgs: LiveChartsCore.VisualElementsEventArgs<TDrawingContext>) => void;
