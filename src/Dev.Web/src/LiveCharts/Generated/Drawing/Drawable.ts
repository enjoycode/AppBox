import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class Drawable extends LiveChartsCore.Animatable implements LiveChartsCore.IDrawable<LiveCharts.SkiaDrawingContext> {
    public abstract Draw(context: LiveCharts.SkiaDrawingContext): void;
}
