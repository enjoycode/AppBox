import * as LiveChartsCore from '@/LiveChartsCore'

export interface ICubicBezierVisualChartPoint<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IVisualChartPoint<TDrawingContext> {


    get Bezier(): LiveChartsCore.CubicBezierSegment;

}
