import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class FinancialSeries<TModel, TVisual extends object & LiveChartsCore.IFinancialVisualChartPoint<TDrawingContext>, TLabel extends object & LiveChartsCore.ILabelGeometry<TDrawingContext>, TMiniatureGeometry extends LiveChartsCore.ISizedGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.CartesianSeries<TModel, TVisual, TLabel, TDrawingContext> implements LiveChartsCore.IFinancialSeries<TDrawingContext> {
    private _upStroke: Nullable<LiveChartsCore.IPaint<TDrawingContext>> = null;
    private _upFill: Nullable<LiveChartsCore.IPaint<TDrawingContext>> = null;
    private _downStroke: Nullable<LiveChartsCore.IPaint<TDrawingContext>> = null;
    private _downFill: Nullable<LiveChartsCore.IPaint<TDrawingContext>> = null;
    private _maxBarWidth: number = 25;

    protected readonly _visualFactory: System.Func1<TVisual>;
    protected readonly _labelFactory: System.Func1<TLabel>;
    protected readonly _miniatureGeometryFactory: System.Func1<TMiniatureGeometry>;

    protected constructor(visualFactory: System.Func1<TVisual>, labelFactory: System.Func1<TLabel>, miniatureGeometryFactory: System.Func1<TMiniatureGeometry>) {
        super(LiveChartsCore.SeriesProperties.Financial | LiveChartsCore.SeriesProperties.PrimaryAxisVerticalOrientation |
            LiveChartsCore.SeriesProperties.Solid | LiveChartsCore.SeriesProperties.PrefersXStrategyTooltips);
        this._visualFactory = visualFactory;
        this._labelFactory = labelFactory;
        this._miniatureGeometryFactory = miniatureGeometryFactory;

        this.TooltipLabelFormatter = p => `${this.Name}, H: ${p.PrimaryValue}, O: ${p.TertiaryValue}, C: ${p.QuaternaryValue}, L: ${p.QuinaryValue}`;
    }

    public get MaxBarWidth(): number {
        return this._maxBarWidth;
    }

    public set MaxBarWidth(value: number) {
        this.SetProperty(new System.Ref(() => this._maxBarWidth, $v => this._maxBarWidth = $v), value);
    }

    public get UpStroke(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._upStroke;
    }

    public set UpStroke(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._upStroke, $v => this._upStroke = $v), value, true);
    }

    public get UpFill(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._upFill;
    }

    public set UpFill(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._upFill, $v => this._upFill = $v), value);
    }

    public get DownStroke(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._downStroke;
    }

    public set DownStroke(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._downStroke, $v => this._downStroke = $v), value, true);
    }

    public get DownFill(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._downFill;
    }

    public set DownFill(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._downFill, $v => this._downFill = $v), value);
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

        let uw = secondaryScale.MeasureInPixels(secondaryAxis.UnitWidth);
        let puw = previousSecondaryScale == null ? 0 : previousSecondaryScale.MeasureInPixels(secondaryAxis.UnitWidth);
        let uwm = 0.5 * uw;

        if (uw > this.MaxBarWidth) {
            uw = <number><unknown>this.MaxBarWidth;
            uwm = uw * 0.5;
            puw = uw;
        }

        let actualZIndex = this.ZIndex == 0 ? (<LiveChartsCore.ISeries><unknown>this).SeriesId : this.ZIndex;

        if (this.UpFill != null) {
            this.UpFill.ZIndex = actualZIndex + 0.1;
            this.UpFill.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
            cartesianChart.Canvas.AddDrawableTask(this.UpFill);
        }
        if (this.DownFill != null) {
            this.DownFill.ZIndex = actualZIndex + 0.1;
            this.DownFill.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
            cartesianChart.Canvas.AddDrawableTask(this.DownFill);
        }
        if (this.UpStroke != null) {
            this.UpStroke.ZIndex = actualZIndex + 0.2;
            this.UpStroke.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
            cartesianChart.Canvas.AddDrawableTask(this.UpStroke);
        }
        if (this.DownStroke != null) {
            this.DownStroke.ZIndex = actualZIndex + 0.2;
            this.DownStroke.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
            cartesianChart.Canvas.AddDrawableTask(this.DownStroke);
        }
        if (this.DataLabelsPaint != null) {
            this.DataLabelsPaint.ZIndex = actualZIndex + 0.3;

            cartesianChart.Canvas.AddDrawableTask(this.DataLabelsPaint);
        }

        let dls = <number><unknown>this.DataLabelsSize;
        let pointsCleanup = LiveChartsCore.ChartPointCleanupContext.For(this.everFetched);

        for (const point of this.Fetch(cartesianChart)) {
            let visual = point.Context.Visual as TVisual;
            let secondary = secondaryScale.ToPixels(point.SecondaryValue);

            let high = primaryScale.ToPixels(point.PrimaryValue);
            let open = primaryScale.ToPixels(point.TertiaryValue);
            let close = primaryScale.ToPixels(point.QuaternaryValue);
            let low = primaryScale.ToPixels(point.QuinaryValue);
            let middle = open;

            if (point.IsEmpty) {
                if (visual != null) {
                    visual.X = secondary - uwm;
                    visual.Width = uw;
                    visual.Y = middle;
                    visual.Open = middle;
                    visual.Close = middle;
                    visual.Low = middle;
                    visual.RemoveOnCompleted = true;
                    point.Context.Visual = null;
                }
                continue;
            }

            if (visual == null) {
                let xi = secondary - uwm;
                let uwi = uw;
                let hi = 0;

                if (previousSecondaryScale != null && previousPrimaryScale != null) {
                    let previousP = previousPrimaryScale.ToPixels(this.pivot);
                    let previousPrimary = previousPrimaryScale.ToPixels(point.PrimaryValue);
                    let bp = Math.abs(previousPrimary - previousP);
                    let cyp = point.PrimaryValue > this.pivot ? previousPrimary : previousPrimary - bp;

                    xi = previousSecondaryScale.ToPixels(point.SecondaryValue) - uwm;
                    uwi = puw;
                    hi = cartesianChart.IsZoomingOrPanning ? bp : 0;
                }


                let r = this._visualFactory();
                r.X = xi;
                r.Width = uwi;
                r.Y = middle;
                r.Open = middle;
                r.Close = middle;
                r.Low = middle;

                visual = r;
                point.Context.Visual = visual;
                this.OnPointCreated(point);
                this.everFetched.Add(point);
            }

            if (open > close) {
                this.UpFill?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);
                this.UpStroke?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);
                this.DownFill?.RemoveGeometryFromPainTask(cartesianChart.Canvas, visual);
                this.DownStroke?.RemoveGeometryFromPainTask(cartesianChart.Canvas, visual);
            } else {
                this.DownFill?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);
                this.DownStroke?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);
                this.UpFill?.RemoveGeometryFromPainTask(cartesianChart.Canvas, visual);
                this.UpStroke?.RemoveGeometryFromPainTask(cartesianChart.Canvas, visual);
            }

            let x = secondary - uwm;

            visual.X = x;
            visual.Width = uw;
            visual.Y = high;
            visual.Open = open;
            visual.Close = close;
            visual.Low = low;
            visual.RemoveOnCompleted = false;

            let ha: LiveChartsCore.RectangleHoverArea;
            if (point.Context.HoverArea instanceof LiveChartsCore.RectangleHoverArea)
                ha = (point.Context.HoverArea as LiveChartsCore.RectangleHoverArea)!;
            else
                point.Context.HoverArea = ha = new LiveChartsCore.RectangleHoverArea();
            ha.SetDimensions(secondary - uwm, high, uw, Math.abs(low - high));

            pointsCleanup.Clean(point);

            if (this.DataLabelsPaint != null) {
                let label = <Nullable<TLabel>><unknown>point.Context.Label;

                if (label == null) {

                    let l = this._labelFactory();
                    l.X = secondary - uwm;
                    l.Y = high;
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
                    x, high, uw, Math.abs(low - high), (m).Clone(), this.DataLabelsPosition,
                    this.SeriesProperties, point.PrimaryValue > this.Pivot, (drawLocation).Clone(), (drawMarginSize).Clone());
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

    public GetBounds(chart: LiveChartsCore.CartesianChart<TDrawingContext>, secondaryAxis: LiveChartsCore.ICartesianAxis, primaryAxis: LiveChartsCore.ICartesianAxis): LiveChartsCore.SeriesBounds {
        let rawBounds = this.DataFactory.GetFinancialBounds(chart, this, secondaryAxis, primaryAxis);
        if (rawBounds.HasData) return rawBounds;

        let rawBaseBounds = rawBounds.Bounds;

        let tickPrimary = LiveChartsCore.Extensions.GetTick(primaryAxis, (chart.ControlSize).Clone(), rawBaseBounds.VisiblePrimaryBounds);
        let tickSecondary = LiveChartsCore.Extensions.GetTick(secondaryAxis, (chart.ControlSize).Clone(), rawBaseBounds.VisibleSecondaryBounds);

        let ts = tickSecondary.Value * this.DataPadding.X;
        let tp = tickPrimary.Value * this.DataPadding.Y;


        if (rawBaseBounds.VisibleSecondaryBounds.Delta == 0) ts = secondaryAxis.UnitWidth * this.DataPadding.X;
        if (rawBaseBounds.VisiblePrimaryBounds.Delta == 0) tp = rawBaseBounds.VisiblePrimaryBounds.Max * 0.25;

        let rgs = this.GetRequestedGeometrySize();
        let rso = this.GetRequestedSecondaryOffset();
        let rpo = this.GetRequestedPrimaryOffset();

        let dimensionalBounds = new LiveChartsCore.DimensionalBounds().Init(
            {
                SecondaryBounds: new LiveChartsCore.Bounds().Init(
                    {
                        Max: rawBaseBounds.SecondaryBounds.Max + rso * secondaryAxis.UnitWidth,
                        Min: rawBaseBounds.SecondaryBounds.Min - rso * secondaryAxis.UnitWidth,
                        MinDelta: rawBaseBounds.SecondaryBounds.MinDelta,
                        PaddingMax: ts,
                        PaddingMin: ts,
                        RequestedGeometrySize: rgs
                    }),
                PrimaryBounds: new LiveChartsCore.Bounds().Init(
                    {
                        Max: rawBaseBounds.PrimaryBounds.Max + rpo * secondaryAxis.UnitWidth,
                        Min: rawBaseBounds.PrimaryBounds.Min - rpo * secondaryAxis.UnitWidth,
                        MinDelta: rawBaseBounds.PrimaryBounds.MinDelta,
                        PaddingMax: tp,
                        PaddingMin: tp,
                        RequestedGeometrySize: rgs
                    }),
                VisibleSecondaryBounds: new LiveChartsCore.Bounds().Init(
                    {
                        Max: rawBaseBounds.VisibleSecondaryBounds.Max + rso * secondaryAxis.UnitWidth,
                        Min: rawBaseBounds.VisibleSecondaryBounds.Min - rso * secondaryAxis.UnitWidth,
                    }),
                VisiblePrimaryBounds: new LiveChartsCore.Bounds().Init(
                    {
                        Max: rawBaseBounds.VisiblePrimaryBounds.Max + rpo * secondaryAxis.UnitWidth,
                        Min: rawBaseBounds.VisiblePrimaryBounds.Min - rpo * secondaryAxis.UnitWidth
                    }),
                TertiaryBounds: rawBaseBounds.TertiaryBounds,
                VisibleTertiaryBounds: rawBaseBounds.VisibleTertiaryBounds
            });

        if (this.GetIsInvertedBounds()) {
            let tempSb = dimensionalBounds.SecondaryBounds;
            let tempPb = dimensionalBounds.PrimaryBounds;
            let tempVsb = dimensionalBounds.VisibleSecondaryBounds;
            let tempVpb = dimensionalBounds.VisiblePrimaryBounds;

            dimensionalBounds.SecondaryBounds = tempPb;
            dimensionalBounds.PrimaryBounds = tempSb;
            dimensionalBounds.VisibleSecondaryBounds = tempVpb;
            dimensionalBounds.VisiblePrimaryBounds = tempVsb;
        }

        return new LiveChartsCore.SeriesBounds(dimensionalBounds, false);
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
            "visual.Open",
            "visual.Close",
            "visual.Low")
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
        visual.Open = p;
        visual.Close = p;
        visual.Low = p;
        visual.RemoveOnCompleted = true;

        this.DataFactory.DisposePoint(point);

        let label = <Nullable<TLabel>><unknown>point.Context.Label;
        if (label == null) return;

        label.TextSize = 1;
        label.RemoveOnCompleted = true;
    }

    public GetPaintTasks(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>[] {
        return [this._upFill, this._upStroke, this._downFill, this._downStroke, this.DataLabelsPaint, this.hoverPaint];
    }

    protected OnPaintChanged(propertyName: Nullable<string>) {
        super.OnPaintChanged(propertyName);
        this.OnPropertyChanged();
    }

    public MiniatureEquals(series: LiveChartsCore.IChartSeries<TDrawingContext>): boolean {
        if (series instanceof FinancialSeries<TModel, TVisual, TLabel, TMiniatureGeometry, TDrawingContext>) {
            const financial = series;
            return this.Name == series.Name &&
                this.UpFill == financial.UpFill && this.UpStroke == financial.UpStroke &&
                this.DownFill == financial.DownFill && this.DownStroke == financial.DownStroke;
        }
        return false;
    }

    public GetMiniatresSketch(): LiveChartsCore.Sketch<TDrawingContext> {
        let schedules = new System.List<LiveChartsCore.PaintSchedule<TDrawingContext>>();

        if (this.UpStroke != null) schedules.Add(this.BuildMiniatureSchedule(this.UpStroke, this._miniatureGeometryFactory()));

        return new LiveChartsCore.Sketch<TDrawingContext>().Init(
            {
                Height: this.MiniatureShapeSize,
                Width: this.MiniatureShapeSize,
                PaintSchedules: schedules
            });
    }
}
