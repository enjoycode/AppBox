import * as System from '@/System'
import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class StepPoint<TGeometry extends object & LiveChartsCore.ISizedVisualChartPoint<LiveCharts.SkiaDrawingContext>> extends LiveChartsCore.StepLineVisualPoint<LiveCharts.SkiaDrawingContext, TGeometry> {
    public constructor(visualFactory: System.Func1<TGeometry>) {
        super(visualFactory);
    }
}
