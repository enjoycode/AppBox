import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class PolarAxis
    extends LiveChartsCore.PolarAxis<LiveCharts.SkiaDrawingContext, LiveCharts.LabelGeometry, LiveCharts.LineGeometry, LiveCharts.CircleGeometry> {
    public constructor() {
        super(() => new LiveCharts.LabelGeometry(),
            () => new LiveCharts.LineGeometry(),
            () => new LiveCharts.CircleGeometry());
    }
}