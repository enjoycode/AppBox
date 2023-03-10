import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class PolarLineSeries<TModel> extends LiveChartsCore.PolarLineSeries<TModel, LiveCharts.CircleGeometry, LiveCharts.LabelGeometry,
    LiveCharts.SkiaDrawingContext, LiveCharts.CubicBezierAreaGeometry, LiveCharts.BezierPoint<LiveCharts.CircleGeometry>> {
    public constructor() {
        super(() => new LiveCharts.CircleGeometry(), () => new LiveCharts.LabelGeometry(),
            () => new LiveCharts.CubicBezierAreaGeometry(),
            () => new LiveCharts.BezierPoint<LiveCharts.CircleGeometry>(new LiveCharts.CircleGeometry()));
    }
}

// /// <summary>
// /// Defines a polar line series in the user interface.
// /// </summary>
// /// <typeparam name="TModel">
// /// The type of the points, you can use any type, the library already knows how to handle the most common numeric types,
// /// to use a custom type, you must register the type globally 
// /// (<see cref="LiveChartsSettings.HasMap{TModel}(System.Action{TModel, ChartPoint})"/>)
// /// or at the series level 
// /// (<see cref="Series{TModel, TVisual, TLabel, TDrawingContext}.Mapping"/>).
// /// </typeparam>
// /// <typeparam name="TVisual">
// /// The type of the geometry of every point of the series.
// /// </typeparam>
// public class PolarLineSeries<TModel, TVisual> : PolarLineSeries<TModel, TVisual, LabelGeometry>
//     where TVisual : class, ISizedVisualChartPoint<SkiaSharpDrawingContext>, new()
// { }
//
// /// <summary>
// /// Defines a polar line series in the user interface.
// /// </summary>
// /// <typeparam name="TModel">
// /// The type of the points, you can use any type, the library already knows how to handle the most common numeric types,
// /// to use a custom type, you must register the type globally 
// /// (<see cref="LiveChartsSettings.HasMap{TModel}(System.Action{TModel, ChartPoint})"/>)
// /// or at the series level 
// /// (<see cref="Series{TModel, TVisual, TLabel, TDrawingContext}.Mapping"/>).
// /// </typeparam>
// /// <typeparam name="TVisual">
// /// The type of the geometry of every point of the series.
// /// </typeparam>
// /// <typeparam name="TLabel">
// /// The type of the data label of every point.
// /// </typeparam>
// public class PolarLineSeries<TModel, TVisual, TLabel>
//     : PolarLineSeries<TModel, TVisual, TLabel, SkiaSharpDrawingContext, CubicBezierAreaGeometry, BezierPoint<TVisual>>
//     where TVisual : class, ISizedVisualChartPoint<SkiaSharpDrawingContext>, new()
//     where TLabel : class, ILabelGeometry<SkiaSharpDrawingContext>, new()
// { }