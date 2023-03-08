import * as LiveChartsCore from '@/LiveChartsCore'

export interface IStepLineVisualChartPoint<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IVisualChartPoint<TDrawingContext> {


    get StepSegment(): LiveChartsCore.StepLineSegment;

}
