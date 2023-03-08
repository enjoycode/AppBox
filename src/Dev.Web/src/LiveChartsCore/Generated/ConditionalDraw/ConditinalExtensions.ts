import * as LiveChartsCore from '@/LiveChartsCore'

export class ConditionalDrawExtensions {
    public static WithConditionalPaint<TModel, TVisual extends object & LiveChartsCore.IVisualChartPoint<TDrawingContext>, TLabel extends object & LiveChartsCore.ILabelGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext>(series: LiveChartsCore.Series<TModel, TVisual, TLabel, TDrawingContext>, paint: LiveChartsCore.IPaint<TDrawingContext>): LiveChartsCore.ConditionalPaintBuilder<TModel, TVisual, TLabel, TDrawingContext> {
        return new LiveChartsCore.ConditionalPaintBuilder<TModel, TVisual, TLabel, TDrawingContext>(series, paint);
    }
}
