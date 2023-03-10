import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class StackedStepAreaSeries<TModel> extends LiveChartsCore.StackedStepAreaSeries<TModel, LiveCharts.CircleGeometry, LiveCharts.LabelGeometry, LiveCharts.SkiaDrawingContext, LiveCharts.StepLineAreaGeometry,
    LiveCharts.StepPoint<LiveCharts.CircleGeometry>> {
    public constructor() {
        super(() => new LiveCharts.CircleGeometry(), () => new LiveCharts.LabelGeometry(),
            () => new LiveCharts.StepLineAreaGeometry(), () => new LiveCharts.StepPoint<LiveCharts.CircleGeometry>(() => new LiveCharts.CircleGeometry()));
    }
}

// /// <summary>
// /// Defines a stacked area series in the user interface.
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
// public class StackedStepAreaSeries<TModel, TVisual>
//     : StackedStepAreaSeries<TModel, TVisual, LabelGeometry>
//     where TVisual : class, ISizedVisualChartPoint<SkiaSharpDrawingContext>, new()
// { }
//
// /// <summary>
// /// Defines a stacked area series in the user interface.
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
// public class StackedStepAreaSeries<TModel, TVisual, TLabel>
//     : StackedStepAreaSeries<TModel, TVisual, TLabel, SkiaSharpDrawingContext, StepLineAreaGeometry, StepPoint<TVisual>>
//     where TVisual : class, ISizedVisualChartPoint<SkiaSharpDrawingContext>, new()
//     where TLabel : class, ILabelGeometry<SkiaSharpDrawingContext>, new()
// { }