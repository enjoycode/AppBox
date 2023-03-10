import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class RowSeries<TModel> extends LiveChartsCore.RowSeries<TModel, LiveCharts.RoundedRectangleGeometry, LiveCharts.LabelGeometry, LiveCharts.SkiaDrawingContext> {
    public constructor() {
        super(() => new LiveCharts.RoundedRectangleGeometry(), () => new LiveCharts.LabelGeometry());
    }
}

// /// <summary>
// /// Defines a row series in the user interface.
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
// public class RowSeries<TModel, TVisual> : RowSeries<TModel, TVisual, LabelGeometry>
//     where TVisual : class, IRoundedRectangleChartPoint<SkiaSharpDrawingContext>, new()
// { }
//
// /// <summary>
// /// Defines a row series in the user interface.
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
// public class RowSeries<TModel, TVisual, TLabel> : RowSeries<TModel, TVisual, TLabel, SkiaSharpDrawingContext>
//     where TVisual : class, IRoundedRectangleChartPoint<SkiaSharpDrawingContext>, new()
//     where TLabel : class, ILabelGeometry<SkiaSharpDrawingContext>, new()
// { }
