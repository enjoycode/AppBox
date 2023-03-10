import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class Axis extends LiveChartsCore.Axis<LiveCharts.SkiaDrawingContext, LiveCharts.LabelGeometry, LiveCharts.LineGeometry> {
    public constructor() {
        super(() => new LiveCharts.LabelGeometry(), () => new LiveCharts.LineGeometry());
    }
}