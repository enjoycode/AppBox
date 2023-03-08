import * as LiveChartsCore from '@/LiveChartsCore'

export interface IVisualChartPoint<TDrawingContext extends LiveChartsCore.DrawingContext> {
    get MainGeometry(): LiveChartsCore.IGeometry<TDrawingContext>;

}
