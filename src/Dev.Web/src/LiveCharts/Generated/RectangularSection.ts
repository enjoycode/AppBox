import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class RectangularSection extends LiveChartsCore.Section2<LiveCharts.RectangleGeometry, LiveCharts.SkiaDrawingContext> {
    public constructor() {
        super(() => new LiveCharts.RectangleGeometry());
    }
}
