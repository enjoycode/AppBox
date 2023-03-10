import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class PieSeries<TModel> extends LiveChartsCore.PieSeries<TModel, LiveCharts.DoughnutGeometry, LiveCharts.LabelGeometry, LiveCharts.CircleGeometry, LiveCharts.SkiaDrawingContext> {
    public constructor(isGauge: boolean = false, isGaugeFill: boolean = false) {
        super(() => new LiveCharts.DoughnutGeometry(), () => new LiveCharts.LabelGeometry(),
            () => new LiveCharts.CircleGeometry(), isGauge, isGaugeFill);
    }
}

// /// <summary>
// /// Defines a pie series in the user interface.
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
// public class PieSeries<TModel, TVisual> : PieSeries<TModel, TVisual, LabelGeometry>
//     where TVisual : class, IDoughnutVisualChartPoint<SkiaSharpDrawingContext>, new()
// {
//     /// <summary>
//     /// Initializes a new instance of the <see cref="PieSeries{TModel, TVisual}"/> class.
//     /// </summary>
//     /// <param name="isGauge"></param>
//     /// <param name="isGaugeFill"></param>
//     public PieSeries(bool isGauge = false, bool isGaugeFill = false) : base(isGauge, isGaugeFill)
//     { }
// }
//
// /// <summary>
// /// Defines a pie series in the user interface.
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
// public class PieSeries<TModel, TVisual, TLabel> : PieSeries<TModel, TVisual, TLabel, CircleGeometry, SkiaSharpDrawingContext>
//     where TVisual : class, IDoughnutVisualChartPoint<SkiaSharpDrawingContext>, new()
//     where TLabel : class, ILabelGeometry<SkiaSharpDrawingContext>, new()
// {
//     /// <summary>
//     /// Initializes a new instance of the <see cref="PieSeries{TModel, TVisual, TLabel}"/> class.
//     /// </summary>
//     /// <param name="isGauge"></param>
//     /// <param name="isGaugeFill"></param>
//     public PieSeries(bool isGauge = false, bool isGaugeFill = false) : base(isGauge, isGaugeFill)
//     { }
// }