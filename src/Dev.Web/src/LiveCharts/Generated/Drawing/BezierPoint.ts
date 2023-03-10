import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class BezierPoint<TGeometry extends object & LiveChartsCore.ISizedVisualChartPoint<LiveCharts.SkiaDrawingContext>> extends LiveChartsCore.BezierVisualPoint<LiveCharts.SkiaDrawingContext, TGeometry> {
    public constructor(geometry: TGeometry) {
        super(geometry);
    }
}
