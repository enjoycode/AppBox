import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class HeatSeries<TModel, TVisual extends object & LiveChartsCore.ISolidColorChartPoint<TDrawingContext>, TLabel extends object & LiveChartsCore.ILabelGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.CartesianSeries<TModel, TVisual, TLabel, TDrawingContext> implements LiveChartsCore.IHeatSeries<TDrawingContext> {
    private _paintTaks: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _weightBounds: LiveChartsCore.Bounds = new LiveChartsCore.Bounds();
    private _heatKnownLength: number = 0;
    private _heatStops: System.List<ColorStop> = new System.List();
    private _heatMap: LiveChartsCore.LvcColor[] = [
        LiveChartsCore.LvcColor.FromArgb(255, 87, 103, 222), // cold (min value)
        LiveChartsCore.LvcColor.FromArgb(255, 95, 207, 249) // hot (max value)
    ];
    private _colorStops: Nullable<Float64Array>;
    private _pointPadding: LiveChartsCore.Padding = LiveChartsCore.Padding.All(4);

    private readonly _visualFactory: System.Func1<TVisual>;
    private readonly _labelFactory: System.Func1<TLabel>;

    protected constructor(visualFactory: System.Func1<TVisual>, labelFactory: System.Func1<TLabel>) {
        super(LiveChartsCore.SeriesProperties.Heat | LiveChartsCore.SeriesProperties.PrimaryAxisVerticalOrientation |
            LiveChartsCore.SeriesProperties.Solid | LiveChartsCore.SeriesProperties.PrefersXYStrategyTooltips);
        this._visualFactory = visualFactory;
        this._labelFactory = labelFactory;

        this.DataPadding = new LiveChartsCore.LvcPoint(0, 0);
        this.TooltipLabelFormatter = (point) => `${this.Name}: ${point.TertiaryValue}`;
    }

    public get HeatMap(): LiveChartsCore.LvcColor[] {
        return this._heatMap;
    }

    public set HeatMap(value: LiveChartsCore.LvcColor[]) {
        this.OnMiniatureChanged();
        this.SetProperty(new System.Ref(() => this._heatMap, $v => this._heatMap = $v), value);
    }

    public get ColorStops(): Nullable<Float64Array> {
        return this._colorStops;
    }

    public set ColorStops(value: Nullable<Float64Array>) {
        this.SetProperty(new System.Ref(() => this._colorStops, $v => this._colorStops = $v), value);
    }

    public get PointPadding(): LiveChartsCore.Padding {
        return this._pointPadding;
    }

    public set PointPadding(value: LiveChartsCore.Padding) {
        this.SetProperty(new System.Ref(() => this._pointPadding, $v => this._pointPadding = $v), value);
    }

    public Invalidate(chart: LiveChartsCore.Chart<TDrawingContext>) {
        this._paintTaks ??= LiveChartsCore.LiveCharts.DefaultSettings.GetProvider<TDrawingContext>().GetSolidColorPaint();

        let cartesianChart = <LiveChartsCore.CartesianChart<TDrawingContext>><unknown>chart;
        let primaryAxis = cartesianChart.YAxes[this.ScalesYAt];
        let secondaryAxis = cartesianChart.XAxes[this.ScalesXAt];

        let drawLocation = (cartesianChart.DrawMarginLocation).Clone();
        let drawMarginSize = (cartesianChart.DrawMarginSize).Clone();
        let secondaryScale = LiveChartsCore.Extensions.GetNextScaler(secondaryAxis, cartesianChart);
        let primaryScale = LiveChartsCore.Extensions.GetNextScaler(primaryAxis, cartesianChart);
        let previousPrimaryScale = LiveChartsCore.Extensions.GetActualScaler(primaryAxis, cartesianChart);
        let previousSecondaryScale = LiveChartsCore.Extensions.GetActualScaler(secondaryAxis, cartesianChart);

        let uws = secondaryScale.MeasureInPixels(secondaryAxis.UnitWidth);
        let uwp = primaryScale.MeasureInPixels(primaryAxis.UnitWidth);

        let actualZIndex = this.ZIndex == 0 ? (<LiveChartsCore.ISeries><unknown>this).SeriesId : this.ZIndex;
        if (this._paintTaks != null) {
            this._paintTaks.ZIndex = actualZIndex + 0.2;
            this._paintTaks.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
            cartesianChart.Canvas.AddDrawableTask(this._paintTaks);
        }
        if (this.DataLabelsPaint != null) {
            this.DataLabelsPaint.ZIndex = actualZIndex + 0.3;
            //DataLabelsPaint.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation, drawMarginSize));
            cartesianChart.Canvas.AddDrawableTask(this.DataLabelsPaint);
        }

        let dls = <number><unknown>this.DataLabelsSize;
        let pointsCleanup = LiveChartsCore.ChartPointCleanupContext.For(this.everFetched);

        let p = this.PointPadding;

        if (this._heatKnownLength != this.HeatMap.length) {
            this._heatStops = LiveChartsCore.HeatFunctions.BuildColorStops(this.HeatMap, this.ColorStops);
            this._heatKnownLength = this.HeatMap.length;
        }

        for (const point of this.Fetch(cartesianChart)) {
            let visual = point.Context.Visual as TVisual;
            let primary = primaryScale.ToPixels(point.PrimaryValue);
            let secondary = secondaryScale.ToPixels(point.SecondaryValue);
            let tertiary = <number><unknown>point.TertiaryValue;

            let baseColor = LiveChartsCore.HeatFunctions.InterpolateColor(tertiary, this._weightBounds, this.HeatMap, this._heatStops);

            if (point.IsEmpty) {
                if (visual != null) {
                    visual.X = secondary - uws * 0.5;
                    visual.Y = primary - uwp * 0.5;
                    visual.Width = uws;
                    visual.Height = uwp;
                    visual.RemoveOnCompleted = true;
                    visual.Color = LiveChartsCore.LvcColor.FromColorWithAlpha(0, (visual.Color).Clone());
                    point.Context.Visual = null;
                }
                continue;
            }

            if (visual == null) {
                let xi = secondary - uws * 0.5;
                let yi = primary - uwp * 0.5;

                if (previousSecondaryScale != null && previousPrimaryScale != null) {
                    let previousP = previousPrimaryScale.ToPixels(this.pivot);
                    let previousPrimary = previousPrimaryScale.ToPixels(point.PrimaryValue);
                    let bp = Math.abs(previousPrimary - previousP);
                    let cyp = point.PrimaryValue > this.pivot ? previousPrimary : previousPrimary - bp;

                    xi = previousSecondaryScale.ToPixels(point.SecondaryValue) - uws * 0.5;
                    yi = previousPrimaryScale.ToPixels(point.PrimaryValue) - uwp * 0.5;
                }

                // var r = new TVisual
                // {
                //     X = xi + p.Left,
                //     Y = yi + p.Top,
                //     Width = uws - p.Left - p.Right,
                //     Height = uwp - p.Top - p.Bottom,
                //     Color = LvcColor.FromArgb(0, baseColor.R, baseColor.G, baseColor.B)
                // };
                let r = this._visualFactory();
                r.X = xi + p.Left;
                r.Y = yi + p.Top;
                r.Width = uws - p.Left - p.Right;
                r.Height = uwp - p.Top - p.Bottom;
                r.Color = LiveChartsCore.LvcColor.FromArgb(0, baseColor.R, baseColor.G, baseColor.B);

                visual = r;
                point.Context.Visual = visual;
                this.OnPointCreated(point);
                this.everFetched.Add(point);
            }

            this._paintTaks?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);

            visual.X = secondary - uws * 0.5 + p.Left;
            visual.Y = primary - uwp * 0.5 + p.Top;
            visual.Width = uws - p.Left - p.Right;
            visual.Height = uwp - p.Top - p.Bottom;
            visual.Color = LiveChartsCore.LvcColor.FromArgb(baseColor.A, baseColor.R, baseColor.G, baseColor.B);
            visual.RemoveOnCompleted = false;

            let ha: LiveChartsCore.RectangleHoverArea;
            if (point.Context.HoverArea instanceof LiveChartsCore.RectangleHoverArea)
                ha = (point.Context.HoverArea as LiveChartsCore.RectangleHoverArea)!;
            else
                point.Context.HoverArea = ha = new LiveChartsCore.RectangleHoverArea();
            ha.SetDimensions(secondary - uws * 0.5, primary - uwp * 0.5, uws, uwp);

            pointsCleanup.Clean(point);

            if (this.DataLabelsPaint != null) {
                let label = <Nullable<TLabel>><unknown>point.Context.Label;

                if (label == null) {
                    //var l = new TLabel { X = secondary - uws * 0.5f, Y = primary - uws * 0.5f, RotateTransform = (float)DataLabelsRotation };
                    let l = this._labelFactory();
                    l.X = secondary - uws * 0.5;
                    l.Y = primary - uws * 0.5;
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
                let labelPosition = this.GetLabelPosition(
                    secondary, primary, uws, uws, label.Measure(this.DataLabelsPaint), this.DataLabelsPosition,
                    this.SeriesProperties, point.PrimaryValue > this.Pivot, (drawLocation).Clone(), (drawMarginSize).Clone());
                label.X = labelPosition.X;
                label.Y = labelPosition.Y;
            }

            this.OnPointMeasured(point);
        }

        pointsCleanup.CollectPoints(
            this.everFetched, cartesianChart.View, primaryScale, secondaryScale, this.SoftDeleteOrDisposePoint.bind(this));
    }

    public GetBounds(chart: LiveChartsCore.CartesianChart<TDrawingContext>, secondaryAxis: LiveChartsCore.ICartesianAxis, primaryAxis: LiveChartsCore.ICartesianAxis): LiveChartsCore.SeriesBounds {
        let seriesBounds = super.GetBounds(chart, secondaryAxis, primaryAxis);
        this._weightBounds = seriesBounds.Bounds.TertiaryBounds;
        return seriesBounds;
    }

    protected GetRequestedSecondaryOffset(): number {
        return 0.5;
    }

    protected GetRequestedPrimaryOffset(): number {
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
            "visual.Height",
            "visual.Color")
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

        visual.Color = LiveChartsCore.LvcColor.FromColorWithAlpha(255, (visual.Color).Clone());
        visual.RemoveOnCompleted = true;

        let label = <Nullable<TLabel>><unknown>point.Context.Label;
        if (label == null) return;

        label.TextSize = 1;
        label.RemoveOnCompleted = true;
    }

    public GetMiniatresSketch(): LiveChartsCore.Sketch<TDrawingContext> {
        let schedules = new System.List<LiveChartsCore.PaintSchedule<TDrawingContext>>();

        let strokeClone = LiveChartsCore.LiveCharts.DefaultSettings.GetProvider<TDrawingContext>().GetSolidColorPaint();
        let st = strokeClone.StrokeThickness;

        if (st > LiveChartsCore.Series.MAX_MINIATURE_STROKE_WIDTH) {
            st = LiveChartsCore.Series.MAX_MINIATURE_STROKE_WIDTH;
            strokeClone.StrokeThickness = LiveChartsCore.Series.MAX_MINIATURE_STROKE_WIDTH;
        }

        // var visual = new TVisual
        // {
        //     X = st * 0.5f,
        //     Y = st * 0.5f,
        //     Height = (float)MiniatureShapeSize,
        //     Width = (float)MiniatureShapeSize,
        //     Color = HeatMap[0] // ToDo <- draw the gradient?
        // };
        let visual = this._visualFactory();
        visual.X = st * 0.5;
        visual.Y = st * 0.5;
        visual.Height = <number><unknown>this.MiniatureShapeSize;
        visual.Width = <number><unknown>this.MiniatureShapeSize;
        visual.Color = (this.HeatMap[0]).Clone(); // ToDo <- draw the gradient?

        strokeClone.ZIndex = 1;
        schedules.Add(new LiveChartsCore.PaintSchedule<TDrawingContext>(strokeClone, visual));

        return new LiveChartsCore.Sketch<TDrawingContext>().Init(
            {
                Height: this.MiniatureShapeSize,
                Width: this.MiniatureShapeSize,
                PaintSchedules: schedules
            });
    }

    public MiniatureEquals(instance: LiveChartsCore.IChartSeries<TDrawingContext>): boolean {
        if (instance instanceof HeatSeries<TModel, TVisual, TLabel, TDrawingContext>) {
            const hSeries = instance;
            return this.Name == instance.Name && this.HeatMap == hSeries.HeatMap;
        }
        return false;
    }

    public GetPaintTasks(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>[] {
        return [this._paintTaks, this.hoverPaint];
    }
}

export class ColorStop {
    public constructor(value: number, color: LiveChartsCore.LvcColor) {
        this.Value = value;
        this.Color = (color).Clone();
    }

    public readonly Value: number;
    public readonly Color: LiveChartsCore.LvcColor;
}
