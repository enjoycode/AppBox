import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class Theme<TDrawingContext extends LiveChartsCore.DrawingContext> {
    public AxisBuilder: System.List<System.Action1<LiveChartsCore.IPlane1<TDrawingContext>>> = new System.List();

    public DrawMarginFrameBuilder: System.List<System.Action1<LiveChartsCore.DrawMarginFrame<TDrawingContext>>> = new System.List();

    public SeriesBuilder: System.List<System.Action1<LiveChartsCore.IChartSeries<TDrawingContext>>> = new System.List();

    public PieSeriesBuilder: System.List<System.Action1<LiveChartsCore.IPieSeries<TDrawingContext>>> = new System.List();

    public GaugeSeriesBuilder: System.List<System.Action1<LiveChartsCore.IPieSeries<TDrawingContext>>> = new System.List();

    public GaugeFillSeriesBuilder: System.List<System.Action1<LiveChartsCore.IPieSeries<TDrawingContext>>> = new System.List();

    public CartesianSeriesBuilder: System.List<System.Action1<LiveChartsCore.ICartesianSeries<TDrawingContext>>> = new System.List();

    public StepLineSeriesBuilder: System.List<System.Action1<LiveChartsCore.IStepLineSeries<TDrawingContext>>> = new System.List();

    public StackedStepLineSeriesBuilder: System.List<System.Action1<LiveChartsCore.IStepLineSeries<TDrawingContext>>> = new System.List();

    public LineSeriesBuilder: System.List<System.Action1<LiveChartsCore.ILineSeries<TDrawingContext>>> = new System.List();

    public PolarSeriesBuilder: System.List<System.Action1<LiveChartsCore.IPolarSeries<TDrawingContext>>> = new System.List();

    public PolarLineSeriesBuilder: System.List<System.Action1<LiveChartsCore.IPolarLineSeries<TDrawingContext>>> = new System.List();

    public StackedPolarSeriesBuilder: System.List<System.Action1<LiveChartsCore.IPolarSeries<TDrawingContext>>> = new System.List();

    public HeatSeriesBuilder: System.List<System.Action1<LiveChartsCore.IHeatSeries<TDrawingContext>>> = new System.List();

    public FinancialSeriesBuilder: System.List<System.Action1<LiveChartsCore.IFinancialSeries<TDrawingContext>>> = new System.List();

    public StackedLineSeriesBuilder: System.List<System.Action1<LiveChartsCore.ILineSeries<TDrawingContext>>> = new System.List();

    public BarSeriesBuilder: System.List<System.Action1<LiveChartsCore.IBarSeries<TDrawingContext>>> = new System.List();

    public ColumnSeriesBuilder: System.List<System.Action1<LiveChartsCore.IBarSeries<TDrawingContext>>> = new System.List();

    public RowSeriesBuilder: System.List<System.Action1<LiveChartsCore.IBarSeries<TDrawingContext>>> = new System.List();

    public StackedBarSeriesBuilder: System.List<System.Action1<LiveChartsCore.IStackedBarSeries<TDrawingContext>>> = new System.List();

    public StackedColumnSeriesBuilder: System.List<System.Action1<LiveChartsCore.IStackedBarSeries<TDrawingContext>>> = new System.List();

    public StackedRowSeriesBuilder: System.List<System.Action1<LiveChartsCore.IStackedBarSeries<TDrawingContext>>> = new System.List();

    public ScatterSeriesBuilder: System.List<System.Action1<LiveChartsCore.IScatterSeries<TDrawingContext>>> = new System.List();

    public ApplyStyleToAxis(axis: LiveChartsCore.IPlane1<TDrawingContext>) {
        for (const rule of this.AxisBuilder) rule(axis);
    }

    public ApplyStyleToSeries(series: LiveChartsCore.IChartSeries<TDrawingContext>) {
        for (const rule of this.SeriesBuilder) rule(series);

        if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.PieSeries) == LiveChartsCore.SeriesProperties.PieSeries) {
            if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.Gauge) != 0) {
                if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.GaugeFill) != 0) {
                    for (const rule of this.GaugeFillSeriesBuilder) rule(<LiveChartsCore.IPieSeries<TDrawingContext>><unknown>series);
                } else {
                    for (const rule of this.GaugeSeriesBuilder) rule(<LiveChartsCore.IPieSeries<TDrawingContext>><unknown>series);
                }
            } else {
                for (const rule of this.PieSeriesBuilder) rule(<LiveChartsCore.IPieSeries<TDrawingContext>><unknown>series);
            }
        }

        if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.CartesianSeries) == LiveChartsCore.SeriesProperties.CartesianSeries) {
            for (const rule of this.CartesianSeriesBuilder) rule(<LiveChartsCore.ICartesianSeries<TDrawingContext>><unknown>series);
        }

        if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.Bar) == LiveChartsCore.SeriesProperties.Bar &&
            (series.SeriesProperties & LiveChartsCore.SeriesProperties.Stacked) != LiveChartsCore.SeriesProperties.Stacked) {
            let barSeries = <LiveChartsCore.IBarSeries<TDrawingContext>><unknown>series;
            for (const rule of this.BarSeriesBuilder) rule(barSeries);

            if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.PrimaryAxisVerticalOrientation) == LiveChartsCore.SeriesProperties.PrimaryAxisVerticalOrientation) {
                for (const rule of this.ColumnSeriesBuilder) rule(barSeries);
            }

            if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.PrimaryAxisHorizontalOrientation) == LiveChartsCore.SeriesProperties.PrimaryAxisHorizontalOrientation) {
                for (const rule of this.RowSeriesBuilder) rule(barSeries);
            }
        }

        let stackedBarMask = LiveChartsCore.SeriesProperties.Bar | LiveChartsCore.SeriesProperties.Stacked;
        if ((series.SeriesProperties & stackedBarMask) == stackedBarMask) {
            let stackedBarSeries = <LiveChartsCore.IStackedBarSeries<TDrawingContext>><unknown>series;
            for (const rule of this.StackedBarSeriesBuilder) rule(stackedBarSeries);

            if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.PrimaryAxisVerticalOrientation) == LiveChartsCore.SeriesProperties.PrimaryAxisVerticalOrientation) {
                for (const rule of this.StackedColumnSeriesBuilder) rule(stackedBarSeries);
            }

            if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.PrimaryAxisHorizontalOrientation) == LiveChartsCore.SeriesProperties.PrimaryAxisHorizontalOrientation) {
                for (const rule of this.StackedRowSeriesBuilder) rule(stackedBarSeries);
            }
        }

        if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.Scatter) == LiveChartsCore.SeriesProperties.Scatter) {
            for (const rule of this.ScatterSeriesBuilder) rule(<LiveChartsCore.IScatterSeries<TDrawingContext>><unknown>series);
        }

        if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.StepLine) == LiveChartsCore.SeriesProperties.StepLine) {
            let stepSeries = <LiveChartsCore.IStepLineSeries<TDrawingContext>><unknown>series;
            for (const rule of this.StepLineSeriesBuilder) rule(stepSeries);

            if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.Stacked) == LiveChartsCore.SeriesProperties.Stacked) {
                for (const rule of this.StackedStepLineSeriesBuilder) rule(stepSeries);
            }
        }

        if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.Line) == LiveChartsCore.SeriesProperties.Line) {
            let lineSeries = <LiveChartsCore.ILineSeries<TDrawingContext>><unknown>series;
            for (const rule of this.LineSeriesBuilder) rule(lineSeries);

            if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.Stacked) == LiveChartsCore.SeriesProperties.Stacked) {
                for (const rule of this.StackedLineSeriesBuilder) rule(lineSeries);
            }
        }

        if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.Polar) == LiveChartsCore.SeriesProperties.Polar) {
            let polarSeries = <LiveChartsCore.IPolarSeries<TDrawingContext>><unknown>series;
            for (const rule of this.PolarSeriesBuilder) rule(polarSeries);

            if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.Stacked) == LiveChartsCore.SeriesProperties.Stacked) {
                for (const rule of this.StackedPolarSeriesBuilder) rule(polarSeries);
            }
        }

        if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.PolarLine) == LiveChartsCore.SeriesProperties.PolarLine) {
            let polarSeries = <LiveChartsCore.IPolarLineSeries<TDrawingContext>><unknown>series;
            for (const rule of this.PolarLineSeriesBuilder) rule(polarSeries);

            if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.Stacked) == LiveChartsCore.SeriesProperties.Stacked) {
                for (const rule of this.StackedPolarSeriesBuilder) rule(polarSeries);
            }
        }

        if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.Heat) == LiveChartsCore.SeriesProperties.Heat) {
            let heatSeries = <LiveChartsCore.IHeatSeries<TDrawingContext>><unknown>series;
            for (const rule of this.HeatSeriesBuilder) rule(heatSeries);
        }

        if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.Financial) == LiveChartsCore.SeriesProperties.Financial) {
            let financialSeries = <LiveChartsCore.IFinancialSeries<TDrawingContext>><unknown>series;
            for (const rule of this.FinancialSeriesBuilder) rule(financialSeries);
        }
    }
}
