import * as LiveChartsCore from '@/LiveChartsCore'

export interface IFinancialVisualChartPoint<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IFinancialGeometry<TDrawingContext>, LiveChartsCore.IVisualChartPoint<TDrawingContext> {
}
