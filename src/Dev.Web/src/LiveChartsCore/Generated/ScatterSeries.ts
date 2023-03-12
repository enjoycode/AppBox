import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class ScatterSeries<TModel, TVisual extends object & LiveChartsCore.ISizedVisualChartPoint<TDrawingContext>, TLabel extends object & LiveChartsCore.ILabelGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.StrokeAndFillCartesianSeries<TModel, TVisual, TLabel, TDrawingContext> implements LiveChartsCore.IScatterSeries<TDrawingContext> {
    private _weightBounds: LiveChartsCore.Bounds = new LiveChartsCore.Bounds();

    protected readonly _visualFactory: System.Func1<TVisual>;
    protected readonly _labelFactory: System.Func1<TLabel>;

    public constructor(visualFactory: System.Func1<TVisual>, labelFactory: System.Func1<TLabel>) {
        super(LiveChartsCore.SeriesProperties.Scatter | LiveChartsCore.SeriesProperties.Solid | LiveChartsCore.SeriesProperties.PrefersXYStrategyTooltips);
        this._visualFactory = visualFactory;
        this._labelFactory = labelFactory;

        this.DataPadding = new LiveChartsCore.LvcPoint(1, 1);

        this.DataLabelsFormatter = (point) => `${point.SecondaryValue}, ${point.PrimaryValue}`;
        this.TooltipLabelFormatter = (point) => `${point.Context.Series.Name} ${point.SecondaryValue}, ${point.PrimaryValue}`;
    }

    public MinGeometrySize: number = 6;

    public GeometrySize: number = 24;

    Invalidate(chart: LiveChartsCore.Chart<TDrawingContext>) {
        let cartesianChart = <LiveChartsCore.CartesianChart<TDrawingContext>><unknown>chart;
        let primaryAxis = cartesianChart.YAxes[this.ScalesYAt];
        let secondaryAxis = cartesianChart.XAxes[this.ScalesXAt];

        let drawLocation = (cartesianChart.DrawMarginLocation).Clone();
        let drawMarginSize = (cartesianChart.DrawMarginSize).Clone();
        let xScale = LiveChartsCore.Scaler.Make((drawLocation).Clone(), (drawMarginSize).Clone(), secondaryAxis);
        let yScale = LiveChartsCore.Scaler.Make((drawLocation).Clone(), (drawMarginSize).Clone(), primaryAxis);

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
            //DataLabelsPaint.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation, drawMarginSize));
            cartesianChart.Canvas.AddDrawableTask(this.DataLabelsPaint);
        }

        let dls = <number><unknown>this.DataLabelsSize;
        let pointsCleanup = LiveChartsCore.ChartPointCleanupContext.For(this.everFetched);

        let gs = <number><unknown>this.GeometrySize;
        let hgs = gs / 2;
        let sw = this.Stroke?.StrokeThickness ?? 0;
        let requiresWScale = this._weightBounds.Max - this._weightBounds.Min > 0;
        let wm = -(this.GeometrySize - this.MinGeometrySize) / (this._weightBounds.Max - this._weightBounds.Min);

        let uwx = xScale.MeasureInPixels(secondaryAxis.UnitWidth);
        let uwy = yScale.MeasureInPixels(secondaryAxis.UnitWidth);

        uwx = uwx < gs ? gs : uwx;
        uwy = uwy < gs ? gs : uwy;

        for (const point of this.Fetch(cartesianChart)) {
            let visual = <Nullable<TVisual>><unknown>point.Context.Visual;

            let x = xScale.ToPixels(point.SecondaryValue);
            let y = yScale.ToPixels(point.PrimaryValue);

            if (point.IsEmpty) {
                if (visual != null) {
                    visual.X = x - hgs;
                    visual.Y = y - hgs;
                    visual.Width = 0;
                    visual.Height = 0;
                    visual.RemoveOnCompleted = true;
                    point.Context.Visual = null;
                }
                continue;
            }

            if (requiresWScale) {
                gs = <number><unknown>(wm * (this._weightBounds.Max - point.TertiaryValue) + this.GeometrySize);
                hgs = gs / 2;
            }

            if (visual == null) {
                // var r = new TVisual
                // {
                //     X = x,
                //     Y = y,
                //     Width = 0,
                //     Height = 0
                // };
                let r = this._visualFactory();
                r.X = x;
                r.Y = y;
                r.Width = 0;
                r.Height = 0;

                visual = r;
                point.Context.Visual = visual;
                this.OnPointCreated(point);
                this.everFetched.Add(point);
            }

            this.Fill?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);
            this.Stroke?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);

            let sizedGeometry = visual;

            sizedGeometry.X = x - hgs;
            sizedGeometry.Y = y - hgs;
            sizedGeometry.Width = gs;
            sizedGeometry.Height = gs;

            sizedGeometry.RemoveOnCompleted = false;

            let ha: LiveChartsCore.RectangleHoverArea;
            if (point.Context.HoverArea instanceof LiveChartsCore.RectangleHoverArea)
                ha = (point.Context.HoverArea as LiveChartsCore.RectangleHoverArea)!;
            else
                point.Context.HoverArea = ha = new LiveChartsCore.RectangleHoverArea();
            ha.SetDimensions(x - uwx * 0.5, y - uwy * 0.5, uwx, uwy);

            pointsCleanup.Clean(point);

            if (this.DataLabelsPaint != null) {
                let label: LiveChartsCore.ILabelGeometry<TDrawingContext>;
                if (LiveChartsCore.IsInterfaceOfILabelGeometry(point.Context.Label))
                    label = (point.Context.Label as LiveChartsCore.ILabelGeometry<TDrawingContext>)!;
                else {
                    //var l = new TLabel { X = x - hgs, Y = y - hgs, RotateTransform = (float)DataLabelsRotation };
                    let l = this._labelFactory();
                    l.X = x - hgs;
                    l.Y = y - hgs;
                    l.RotateTransform = <number><unknown>this.DataLabelsRotation;
                    LiveChartsCore.Extensions.TransitionateProperties(l, "X", "Y")
                        .WithAnimationBuilder(animation =>
                            animation
                                .WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed)
                                .WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));

                    l.CompleteTransition();
                    label = l;
                    point.Context.Label = l;
                }

                this.DataLabelsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, label);
                label.Text = this.DataLabelsFormatter(new LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>(point));
                label.TextSize = dls;
                label.Padding = this.DataLabelsPadding;
                let m = label.Measure(this.DataLabelsPaint);
                let labelPosition = this.GetLabelPosition(
                    x - hgs, y - hgs, gs, gs, (m).Clone(), this.DataLabelsPosition,
                    this.SeriesProperties, point.PrimaryValue > 0, (drawLocation).Clone(), (drawMarginSize).Clone());
                if (this.DataLabelsTranslate != null) label.TranslateTransform =
                    new LiveChartsCore.LvcPoint(m.Width * this.DataLabelsTranslate.X, m.Height * this.DataLabelsTranslate.Y);
                label.X = labelPosition.X;
                label.Y = labelPosition.Y;
            }

            this.OnPointMeasured(point);
        }

        pointsCleanup.CollectPoints(this.everFetched, cartesianChart.View, yScale, xScale, this.SoftDeleteOrDisposePoint.bind(this));
    }

    GetBounds(chart: LiveChartsCore.CartesianChart<TDrawingContext>, secondaryAxis: LiveChartsCore.ICartesianAxis, primaryAxis: LiveChartsCore.ICartesianAxis): LiveChartsCore.SeriesBounds {
        let seriesBounds = super.GetBounds(chart, secondaryAxis, primaryAxis);
        this._weightBounds = seriesBounds.Bounds.TertiaryBounds;
        return seriesBounds;
    }

    GetMiniatresSketch(): LiveChartsCore.Sketch<TDrawingContext> {
        let schedules = new System.List<LiveChartsCore.PaintSchedule<TDrawingContext>>();

        if (this.Fill != null) schedules.Add(this.BuildMiniatureSchedule(this.Fill, this._visualFactory()));
        if (this.Stroke != null) schedules.Add(this.BuildMiniatureSchedule(this.Stroke, this._visualFactory()));

        return new LiveChartsCore.Sketch<TDrawingContext>().Init(
            {
                Height: this.MiniatureShapeSize,
                Width: this.MiniatureShapeSize,
                PaintSchedules: schedules
            });
    }

    SetDefaultPointTransitions(chartPoint: LiveChartsCore.ChartPoint) {
        let visual = <Nullable<TVisual>><unknown>chartPoint.Context.Visual;
        let chart = chartPoint.Context.Chart;

        if (visual == null) throw new System.Exception("Unable to initialize the point instance.");
        LiveChartsCore.Extensions.TransitionateProperties(
            visual
            , "X",
            "Y",
            "Width",
            "Height")
            .WithAnimationBuilder(animation =>
                animation
                    .WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed)
                    .WithEasingFunction(this.EasingFunction ?? chart.EasingFunction))
            .CompleteCurrentTransitions();
    }

    SoftDeleteOrDisposePoint(point: LiveChartsCore.ChartPoint, primaryScale: LiveChartsCore.Scaler, secondaryScale: LiveChartsCore.Scaler) {
        let visual = <Nullable<TVisual>><unknown>point.Context.Visual;
        if (visual == null) return;
        if (this.DataFactory == null) throw new System.Exception("Data provider not found");

        let chartView = <LiveChartsCore.ICartesianChartView<TDrawingContext>><unknown>point.Context.Chart;
        if (chartView.Core.IsZoomingOrPanning) {
            visual.CompleteTransition();
            visual.RemoveOnCompleted = true;
            this.DataFactory.DisposePoint(point);
            return;
        }

        let x = secondaryScale.ToPixels(point.SecondaryValue);
        let y = primaryScale.ToPixels(point.PrimaryValue);

        visual.X = x;
        visual.Y = y;
        visual.Height = 0;
        visual.Width = 0;
        visual.RemoveOnCompleted = true;

        this.DataFactory.DisposePoint(point);

        let label = <Nullable<TLabel>><unknown>point.Context.Label;
        if (label == null) return;

        label.TextSize = 1;
        label.RemoveOnCompleted = true;
    }
}
