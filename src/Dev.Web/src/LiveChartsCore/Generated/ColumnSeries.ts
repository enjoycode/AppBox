import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class ColumnSeries<TModel, TVisual extends object & LiveChartsCore.ISizedVisualChartPoint<TDrawingContext>, TLabel extends object & LiveChartsCore.ILabelGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.BarSeries<TModel, TVisual, TLabel, TDrawingContext> {

    protected constructor(visualFactory: System.Func1<TVisual>, labelFactory: System.Func1<TLabel>, isStacked: boolean = false) {
        super(LiveChartsCore.SeriesProperties.Bar | LiveChartsCore.SeriesProperties.PrimaryAxisVerticalOrientation |
            LiveChartsCore.SeriesProperties.Solid | LiveChartsCore.SeriesProperties.PrefersXStrategyTooltips | (isStacked ? LiveChartsCore.SeriesProperties.Stacked : 0),
            visualFactory, labelFactory);
        this.DataPadding = new LiveChartsCore.LvcPoint(0, 1);
    }

    public Invalidate(chart: LiveChartsCore.Chart<TDrawingContext>) {
        let cartesianChart = <LiveChartsCore.CartesianChart<TDrawingContext>><unknown>chart;
        let primaryAxis = cartesianChart.YAxes[this.ScalesYAt];
        let secondaryAxis = cartesianChart.XAxes[this.ScalesXAt];

        let drawLocation = (cartesianChart.DrawMarginLocation).Clone();
        let drawMarginSize = (cartesianChart.DrawMarginSize).Clone();
        let secondaryScale = LiveChartsCore.Extensions.GetNextScaler(secondaryAxis, cartesianChart);
        let primaryScale = LiveChartsCore.Extensions.GetNextScaler(primaryAxis, cartesianChart);
        let previousPrimaryScale = LiveChartsCore.Extensions.GetActualScaler(primaryAxis, cartesianChart);
        let previousSecondaryScale = LiveChartsCore.Extensions.GetActualScaler(secondaryAxis, cartesianChart);

        let isStacked = (this.SeriesProperties & LiveChartsCore.SeriesProperties.Stacked) == LiveChartsCore.SeriesProperties.Stacked;

        let helper = new LiveChartsCore.BarSeries.MeasureHelper<TDrawingContext>(secondaryScale, cartesianChart, this, secondaryAxis, primaryScale.ToPixels(this.pivot),
            cartesianChart.DrawMarginLocation.Y, cartesianChart.DrawMarginLocation.Y + cartesianChart.DrawMarginSize.Height, isStacked);
        let pHelper = previousSecondaryScale == null || previousPrimaryScale == null
            ? null
            : new LiveChartsCore.BarSeries.MeasureHelper<TDrawingContext>(previousSecondaryScale, cartesianChart, this, secondaryAxis, previousPrimaryScale.ToPixels(this.pivot),
                cartesianChart.DrawMarginLocation.Y, cartesianChart.DrawMarginLocation.Y + cartesianChart.DrawMarginSize.Height, isStacked);

        let actualZIndex = this.ZIndex == 0 ? (<LiveChartsCore.ISeries><unknown>this).SeriesId : this.ZIndex;
        if (this.Fill != null) {
            this.Fill.ZIndex = actualZIndex + 0.1;
            this.Fill.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
            cartesianChart.Canvas.AddDrawableTask(this.Fill);
        }
        if (this.Stroke != null) {
            this.Stroke.ZIndex = actualZIndex + 0.2;
            this.Stroke.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
            cartesianChart.Canvas.AddDrawableTask(this.Stroke);
        }
        if (this.DataLabelsPaint != null) {
            this.DataLabelsPaint.ZIndex = actualZIndex + 0.3;

            cartesianChart.Canvas.AddDrawableTask(this.DataLabelsPaint);
        }

        let dls = <number><unknown>this.DataLabelsSize;
        let pointsCleanup = LiveChartsCore.ChartPointCleanupContext.For(this.everFetched);

        let rx = <number><unknown>this.Rx;
        let ry = <number><unknown>this.Ry;

        let stacker = isStacked ? cartesianChart.SeriesContext.GetStackPosition(this, this.GetStackGroup()) : null;

        for (const point of this.Fetch(cartesianChart)) {
            let visual = point.Context.Visual as TVisual;
            let primary = primaryScale.ToPixels(point.PrimaryValue);
            let secondary = secondaryScale.ToPixels(point.SecondaryValue);
            let b = Math.abs(primary - helper.p);

            if (point.IsEmpty) {
                if (visual != null) {
                    visual.X = secondary - helper.uwm + helper.cp;
                    visual.Y = helper.p;
                    visual.Width = helper.uw;
                    visual.Height = 0;
                    visual.RemoveOnCompleted = true;
                    point.Context.Visual = null;
                }
                continue;
            }

            if (visual == null) {
                let xi = secondary - helper.uwm + helper.cp;
                let pi = helper.p;
                let uwi = helper.uw;
                let hi = 0;

                if (previousSecondaryScale != null && previousPrimaryScale != null && pHelper != null) {
                    let previousPrimary = previousPrimaryScale.ToPixels(point.PrimaryValue);
                    let bp = Math.abs(previousPrimary - pHelper.p);
                    let cyp = point.PrimaryValue > this.pivot ? previousPrimary : previousPrimary - bp;

                    xi = previousSecondaryScale.ToPixels(point.SecondaryValue) - pHelper.uwm + pHelper.cp;
                    pi = cartesianChart.IsZoomingOrPanning ? cyp : pHelper.p;
                    uwi = pHelper.uw;
                    hi = cartesianChart.IsZoomingOrPanning ? bp : 0;
                }


                let r = this._visualFactory();
                r.X = xi;
                r.Y = pi;
                r.Width = uwi;
                r.Height = hi;

                if (LiveChartsCore.IsInterfaceOfIRoundedRectangleChartPoint(r)) {
                    const rr1 = r;
                    rr1.Rx = rx;
                    rr1.Ry = ry;
                }

                visual = r;
                point.Context.Visual = visual;
                this.OnPointCreated(point);
                this.everFetched.Add(point);
            }

            this.Fill?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);
            this.Stroke?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);

            let cy = primaryAxis.IsInverted
                ? (point.PrimaryValue > this.pivot ? primary - b : primary)
                : (point.PrimaryValue > this.pivot ? primary : primary - b);
            let x = secondary - helper.uwm + helper.cp;

            if (stacker != null) {
                let sy = stacker.GetStack(point);

                let primaryI: number = 0;
                let primaryJ: number = 0;
                if (point.PrimaryValue >= 0) {
                    primaryI = primaryScale.ToPixels(sy.Start);
                    primaryJ = primaryScale.ToPixels(sy.End);
                } else {
                    primaryI = primaryScale.ToPixels(sy.NegativeStart);
                    primaryJ = primaryScale.ToPixels(sy.NegativeEnd);
                }

                cy = primaryJ;
                b = primaryI - primaryJ;
            }

            visual.X = x;
            visual.Y = cy;
            visual.Width = helper.uw;
            visual.Height = b;

            if (LiveChartsCore.IsInterfaceOfIRoundedRectangleChartPoint(visual)) {
                const rr2 = visual;
                rr2.Rx = rx;
                rr2.Ry = ry;
            }
            visual.RemoveOnCompleted = false;

            let ha: LiveChartsCore.RectangleHoverArea;
            if (point.Context.HoverArea instanceof LiveChartsCore.RectangleHoverArea)
                ha = <LiveChartsCore.RectangleHoverArea><unknown>point.Context.HoverArea;
            else
                point.Context.HoverArea = ha = new LiveChartsCore.RectangleHoverArea();
            ha.SetDimensions(secondary - helper.actualUw * 0.5, cy, helper.actualUw, b);

            pointsCleanup.Clean(point);

            if (this.DataLabelsPaint != null) {
                let label = <Nullable<TLabel>><unknown>point.Context.Label;

                if (label == null) {

                    let l = this._labelFactory();
                    l.X = secondary - helper.uwm + helper.cp;
                    l.Y = helper.p;
                    l.RotateTransform = <number><unknown>this.DataLabelsRotation;
                    LiveChartsCore.Extensions.TransitionateProperties(l, "l.X", "l.Y")
                        .WithAnimationBuilder(animation =>
                            animation
                                .WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed)
                                .WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));

                    l.CompleteTransition(null);
                    label = l;
                    point.Context.Label = l;
                }

                this.DataLabelsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, label);

                label.Text = this.DataLabelsFormatter(new LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>(point));
                label.TextSize = dls;
                label.Padding = this.DataLabelsPadding;
                let m = label.Measure(this.DataLabelsPaint);
                let labelPosition = this.GetLabelPosition(
                    x, cy, helper.uw, b, (m).Clone(),
                    this.DataLabelsPosition, this.SeriesProperties, point.PrimaryValue > this.Pivot, (drawLocation).Clone(), (drawMarginSize).Clone());
                if (this.DataLabelsTranslate != null) label.TranslateTransform =
                    new LiveChartsCore.LvcPoint(m.Width * this.DataLabelsTranslate.X, m.Height * this.DataLabelsTranslate.Y);

                label.X = labelPosition.X;
                label.Y = labelPosition.Y;
            }

            this.OnPointMeasured(point);
        }

        pointsCleanup.CollectPoints(
            this.everFetched, cartesianChart.View, primaryScale, secondaryScale, this.SoftDeleteOrDisposePoint.bind(this));
    }

    protected GetRequestedSecondaryOffset(): number {
        return 0.5;
    }

    protected SetDefaultPointTransitions(chartPoint: LiveChartsCore.ChartPoint) {
        let chart = chartPoint.Context.Chart;

        let visual = (chartPoint.Context.Visual as TVisual)!;
        LiveChartsCore.Extensions.TransitionateProperties(
            visual
            , "visual.X",
            "visual.Width",
            "visual.Y",
            "visual.Height")
            .WithAnimationBuilder(animation =>
                animation
                    .WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed)
                    .WithEasingFunction(this.EasingFunction ?? chart.EasingFunction))
            .CompleteCurrentTransitions();
    }

    public SoftDeleteOrDisposePoint(point: LiveChartsCore.ChartPoint, primaryScale: LiveChartsCore.Scaler, secondaryScale: LiveChartsCore.Scaler) {
        let visual = <Nullable<TVisual>><unknown>point.Context.Visual;
        if (visual == null) return;
        if (this.DataFactory == null) throw new System.Exception("Data provider not found");

        let chartView = <LiveChartsCore.ICartesianChartView<TDrawingContext>><unknown>point.Context.Chart;
        if (chartView.Core.IsZoomingOrPanning) {
            visual.CompleteTransition(null);
            visual.RemoveOnCompleted = true;
            this.DataFactory.DisposePoint(point);
            return;
        }

        let p = primaryScale.ToPixels(this.pivot);
        let secondary = secondaryScale.ToPixels(point.SecondaryValue);

        visual.X = secondary;
        visual.Y = p;
        visual.Height = 0;
        visual.RemoveOnCompleted = true;

        this.DataFactory.DisposePoint(point);

        let label = <Nullable<TLabel>><unknown>point.Context.Label;
        if (label == null) return;

        label.TextSize = 1;
        label.RemoveOnCompleted = true;
    }
}
