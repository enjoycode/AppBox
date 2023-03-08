import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class SeriesStyleRule<TVisual extends LiveChartsCore.IVisualChartPoint<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext> {
    public SeriesProperties: LiveChartsCore.SeriesProperties = 0;

    public Rule: Nullable<System.Action1<LiveChartsCore.IChartSeries<TDrawingContext>>>;
}
