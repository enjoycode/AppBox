import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class LiveChartsStylerExtensions {
    public static HasRuleForAxes<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                        predicate: System.Action1<LiveChartsCore.IPlane1<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.AxisBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForDrawMargin<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                              predicate: System.Action1<LiveChartsCore.DrawMarginFrame<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.DrawMarginFrameBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForAnySeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                             predicate: System.Action1<LiveChartsCore.IChartSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.SeriesBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForPieSeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                             predicate: System.Action1<LiveChartsCore.IPieSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.PieSeriesBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForGaugeSeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                               predicate: System.Action1<LiveChartsCore.IPieSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.GaugeSeriesBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForGaugeFillSeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                                   predicate: System.Action1<LiveChartsCore.IPieSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.GaugeFillSeriesBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForLineSeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                              predicate: System.Action1<LiveChartsCore.ILineSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.LineSeriesBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForStepLineSeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                                  predicate: System.Action1<LiveChartsCore.IStepLineSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.StepLineSeriesBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForStackedStepLineSeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                                         predicate: System.Action1<LiveChartsCore.IStepLineSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.StackedStepLineSeriesBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForStackedLineSeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                                     predicate: System.Action1<LiveChartsCore.ILineSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.StackedLineSeriesBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForBarSeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                             predicate: System.Action1<LiveChartsCore.IBarSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.BarSeriesBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForColumnSeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                                predicate: System.Action1<LiveChartsCore.IBarSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.ColumnSeriesBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForRowSeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                             predicate: System.Action1<LiveChartsCore.IBarSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.ColumnSeriesBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForStackedBarSeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                                    predicate: System.Action1<LiveChartsCore.IStackedBarSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.StackedBarSeriesBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForStackedColumnSeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                                       predicate: System.Action1<LiveChartsCore.IStackedBarSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.StackedColumnSeriesBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForStackedRowSeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                                    predicate: System.Action1<LiveChartsCore.IStackedBarSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.StackedRowSeriesBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForScatterSeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                                 predicate: System.Action1<LiveChartsCore.IScatterSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.ScatterSeriesBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForHeatSeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                              predicate: System.Action1<LiveChartsCore.IHeatSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.HeatSeriesBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForFinancialSeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                                   predicate: System.Action1<LiveChartsCore.IFinancialSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.FinancialSeriesBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForPolaSeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                              predicate: System.Action1<LiveChartsCore.IPolarSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.PolarSeriesBuilder.Add(predicate);
        return styler;
    }

    public static HasRuleForPolarLineSeries<TDrawingContext extends LiveChartsCore.DrawingContext>(styler: LiveChartsCore.Theme<TDrawingContext>,
                                                                                                   predicate: System.Action1<LiveChartsCore.IPolarLineSeries<TDrawingContext>>): LiveChartsCore.Theme<TDrawingContext> {
        styler.PolarLineSeriesBuilder.Add(predicate);
        return styler;
    }
}
