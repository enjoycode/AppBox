import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class LineSeries<TModel> extends LiveChartsCore.LineSeries<TModel, LiveCharts.CircleGeometry, LiveCharts.LabelGeometry, LiveCharts.SkiaDrawingContext,
    LiveCharts.CubicBezierAreaGeometry, LiveCharts.BezierPoint<LiveCharts.CircleGeometry>> {
    public constructor(isStacked: boolean = false) {
        super(() => new LiveCharts.CircleGeometry(), () => new LiveCharts.LabelGeometry(),
            () => new LiveCharts.CubicBezierAreaGeometry(),
            () => new LiveCharts.BezierPoint<LiveCharts.CircleGeometry>(new LiveCharts.CircleGeometry()),
            isStacked);
    }
}

// public class LineSeries<TModel, TVisual> : LineSeries<TModel, TVisual, LabelGeometry>
//     where TVisual : class, ISizedVisualChartPoint<SkiaSharpDrawingContext>, new()
// { }

// public class LineSeries<TModel, TVisual, TLabel>
//     : LineSeries<TModel, TVisual, TLabel, SkiaSharpDrawingContext, CubicBezierAreaGeometry, BezierPoint<TVisual>>
//     where TVisual : class, ISizedVisualChartPoint<SkiaSharpDrawingContext>, new()
//     where TLabel : class, ILabelGeometry<SkiaSharpDrawingContext>, new()
// { }