import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class DrawMarginFrame extends LiveChartsCore.DrawMarginFrame2<LiveCharts.RectangleGeometry, LiveCharts.SkiaDrawingContext> {
    public constructor() {
        super(() => new LiveCharts.RectangleGeometry());
    }
}