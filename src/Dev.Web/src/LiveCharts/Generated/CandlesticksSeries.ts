import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class CandlesticksSeries<TModel> extends LiveChartsCore.FinancialSeries<TModel, LiveCharts.CandlestickGeometry, LiveCharts.LabelGeometry,
    LiveCharts.CircleGeometry,
    LiveCharts.SkiaDrawingContext> {
    public constructor() {
        super(() => new LiveCharts.CandlestickGeometry(),
            () => new LiveCharts.LabelGeometry(),
            () => new LiveCharts.CircleGeometry());
    }
}

// /// <summary>
// /// Defines a candlesticks series in the user interface.
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
// public class CandlesticksSeries<TModel, TVisual> : CandlesticksSeries<TModel, TVisual, LabelGeometry>
//     where TVisual : class, IFinancialVisualChartPoint<SkiaSharpDrawingContext>, new()
// { }
//
// /// <summary>
// /// Defines a candlesticks series in the user interface.
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
// public class CandlesticksSeries<TModel, TVisual, TLabel> : FinancialSeries<TModel, TVisual, TLabel, CircleGeometry, SkiaSharpDrawingContext>
//     where TVisual : class, IFinancialVisualChartPoint<SkiaSharpDrawingContext>, new()
//     where TLabel : class, ILabelGeometry<SkiaSharpDrawingContext>, new()
// { }