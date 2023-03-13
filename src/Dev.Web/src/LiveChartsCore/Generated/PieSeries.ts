import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class PieSeries<TModel, TVisual extends object & LiveChartsCore.IDoughnutVisualChartPoint<TDrawingContext>, TLabel extends object & LiveChartsCore.ILabelGeometry<TDrawingContext>, TMiniatureGeometry extends LiveChartsCore.ISizedGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.ChartSeries<TModel, TVisual, TLabel, TDrawingContext> implements LiveChartsCore.IPieSeries<TDrawingContext> {
    private static readonly $meta_LiveChartsCore_IPieSeries = true;
    private _stroke: Nullable<LiveChartsCore.IPaint<TDrawingContext>> = null;
    private _fill: Nullable<LiveChartsCore.IPaint<TDrawingContext>> = null;
    private _pushout: number = 0;
    private _innerRadius: number = 0;
    private _maxOuterRadius: number = 1;
    private _hoverPushout: number = 20;
    private _innerPadding: number = 0;
    private _outerPadding: number = 0;
    private _maxRadialColW: number = 1.7976931348623157E+308/*DoubleMax*/;
    private _cornerRadius: number = 0;
    private _radialAlign: LiveChartsCore.RadialAlignment = LiveChartsCore.RadialAlignment.Outer;
    private _invertedCornerRadius: boolean = false;
    private _isFillSeries: boolean = false;
    private _labelsPosition: LiveChartsCore.PolarLabelsPosition = LiveChartsCore.PolarLabelsPosition.Middle;

    protected readonly _visualFactory: System.Func1<TVisual>;
    protected readonly _labelFactory: System.Func1<TLabel>;
    protected readonly _miniatureGeometryFactory: System.Func1<TMiniatureGeometry>;

    protected constructor(visualFactory: System.Func1<TVisual>, labelFactory: System.Func1<TLabel>,
                          miniatureGeometryFactory: System.Func1<TMiniatureGeometry>, isGauge: boolean = false, isGaugeFill: boolean = false) {
        super(LiveChartsCore.SeriesProperties.PieSeries | LiveChartsCore.SeriesProperties.Stacked |
            (isGauge ? LiveChartsCore.SeriesProperties.Gauge : 0) | (isGaugeFill ? LiveChartsCore.SeriesProperties.GaugeFill : 0) |
            LiveChartsCore.SeriesProperties.Solid);
        this._visualFactory = visualFactory;
        this._labelFactory = labelFactory;
        this._miniatureGeometryFactory = miniatureGeometryFactory;
    }

    public get Stroke(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._stroke;
    }

    public set Stroke(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._stroke, $v => this._stroke = $v), value, true, "Stroke");
    }

    public get Fill(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._fill;
    }

    public set Fill(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._fill, $v => this._fill = $v), value, undefined, "Fill");
    }

    public get Pushout(): number {
        return this._pushout;
    }

    public set Pushout(value: number) {
        this.SetProperty(new System.Ref(() => this._pushout, $v => this._pushout = $v), value, "Pushout");
    }

    public get InnerRadius(): number {
        return this._innerRadius;
    }

    public set InnerRadius(value: number) {
        this.SetProperty(new System.Ref(() => this._innerRadius, $v => this._innerRadius = $v), value, "InnerRadius");
    }

    public get MaxOuterRadius(): number {
        return this._maxOuterRadius;
    }

    public set MaxOuterRadius(value: number) {
        this.SetProperty(new System.Ref(() => this._maxOuterRadius, $v => this._maxOuterRadius = $v), value, "MaxOuterRadius");
    }

    public get HoverPushout(): number {
        return this._hoverPushout;
    }

    public set HoverPushout(value: number) {
        this.SetProperty(new System.Ref(() => this._hoverPushout, $v => this._hoverPushout = $v), value, "HoverPushout");
    }

    public get RelativeInnerRadius(): number {
        return this._innerPadding;
    }

    public set RelativeInnerRadius(value: number) {
        this.SetProperty(new System.Ref(() => this._innerPadding, $v => this._innerPadding = $v), value, "RelativeInnerRadius");
    }

    public get RelativeOuterRadius(): number {
        return this._outerPadding;
    }

    public set RelativeOuterRadius(value: number) {
        this.SetProperty(new System.Ref(() => this._outerPadding, $v => this._outerPadding = $v), value, "RelativeOuterRadius");
    }

    public get MaxRadialColumnWidth(): number {
        return this._maxRadialColW;
    }

    public set MaxRadialColumnWidth(value: number) {
        this.SetProperty(new System.Ref(() => this._maxRadialColW, $v => this._maxRadialColW = $v), value, "MaxRadialColumnWidth");
    }

    public get RadialAlign(): LiveChartsCore.RadialAlignment {
        return this._radialAlign;
    }

    public set RadialAlign(value: LiveChartsCore.RadialAlignment) {
        this.SetProperty(new System.Ref(() => this._radialAlign, $v => this._radialAlign = $v), value, "RadialAlign");
    }

    public get CornerRadius(): number {
        return this._cornerRadius;
    }

    public set CornerRadius(value: number) {
        this.SetProperty(new System.Ref(() => this._cornerRadius, $v => this._cornerRadius = $v), value, "CornerRadius");
    }

    public get InvertedCornerRadius(): boolean {
        return this._invertedCornerRadius;
    }

    public set InvertedCornerRadius(value: boolean) {
        this.SetProperty(new System.Ref(() => this._invertedCornerRadius, $v => this._invertedCornerRadius = $v), value, "InvertedCornerRadius");
    }

    public get IsFillSeries(): boolean {
        return this._isFillSeries;
    }

    public set IsFillSeries(value: boolean) {
        this.SetProperty(new System.Ref(() => this._isFillSeries, $v => this._isFillSeries = $v), value, "IsFillSeries");
    }

    public get DataLabelsPosition(): LiveChartsCore.PolarLabelsPosition {
        return this._labelsPosition;
    }

    public set DataLabelsPosition(value: LiveChartsCore.PolarLabelsPosition) {
        this.SetProperty(new System.Ref(() => this._labelsPosition, $v => this._labelsPosition = $v), value, "DataLabelsPosition");
    }

    Invalidate(chart: LiveChartsCore.Chart<TDrawingContext>) {
        let pieChart = <LiveChartsCore.PieChart<TDrawingContext>><unknown>chart;

        let drawLocation = (pieChart.DrawMarginLocation).Clone();
        let drawMarginSize = (pieChart.DrawMarginSize).Clone();
        let minDimension = drawMarginSize.Width < drawMarginSize.Height ? drawMarginSize.Width : drawMarginSize.Height;

        let maxPushout = <number><unknown>pieChart.PushoutBounds.Max;
        let pushout = <number><unknown>this.Pushout;
        let innerRadius = <number><unknown>this.InnerRadius;
        let maxOuterRadius = <number><unknown>this.MaxOuterRadius;

        minDimension = minDimension - (this.Stroke?.StrokeThickness ?? 0) * 2 - maxPushout * 2;
        minDimension *= maxOuterRadius;

        let view = <LiveChartsCore.IPieChartView<TDrawingContext>><unknown>pieChart.View;
        let initialRotation = <number><unknown>Math.trunc(view.InitialRotation);
        let completeAngle = <number><unknown>view.MaxAngle;
        let chartTotal = <Nullable<number>><unknown>view.Total;

        let actualZIndex = this.ZIndex == 0 ? (<LiveChartsCore.ISeries><unknown>this).SeriesId : this.ZIndex;
        if (this.Fill != null) {
            this.Fill.ZIndex = actualZIndex + 0.1;
            this.Fill.SetClipRectangle(pieChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
            pieChart.Canvas.AddDrawableTask(this.Fill);
        }
        if (this.Stroke != null) {
            this.Stroke.ZIndex = actualZIndex + 0.2;
            this.Stroke.SetClipRectangle(pieChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
            pieChart.Canvas.AddDrawableTask(this.Stroke);
        }
        if (this.DataLabelsPaint != null) {
            this.DataLabelsPaint.ZIndex = 1000 + actualZIndex + 0.3;
            //DataLabelsPaint.SetClipRectangle(pieChart.Canvas, new LvcRectangle(drawLocation, drawMarginSize));
            pieChart.Canvas.AddDrawableTask(this.DataLabelsPaint);
        }

        let cx = drawLocation.X + drawMarginSize.Width * 0.5;
        let cy = drawLocation.Y + drawMarginSize.Height * 0.5;

        let dls = <number><unknown>this.DataLabelsSize;
        let stacker = pieChart.SeriesContext.GetStackPosition(this, this.GetStackGroup());
        if (stacker == null) throw new System.Exception("Unexpected null stacker");

        let pointsCleanup = LiveChartsCore.ChartPointCleanupContext.For(this.everFetched);

        let fetched = this.Fetch(pieChart).ToArray();

        let stackedInnerRadius = innerRadius;
        let relativeInnerRadius = <number><unknown>this.RelativeInnerRadius;
        let relativeOuterRadius = <number><unknown>this.RelativeOuterRadius;
        let maxRadialWidth = <number><unknown>this.MaxRadialColumnWidth;
        let cornerRadius = <number><unknown>this.CornerRadius;

        let mdc = minDimension;
        let wc = mdc - (mdc - 2 * innerRadius) * (fetched.length - 1) / fetched.length - relativeOuterRadius * 2;

        if (wc * 0.5 - stackedInnerRadius > maxRadialWidth) {
            let dw = wc * 0.5 - stackedInnerRadius - maxRadialWidth;

            switch (this.RadialAlign) {
                case LiveChartsCore.RadialAlignment.Outer:
                    relativeOuterRadius = 0;
                    relativeInnerRadius = dw;
                    break;
                case LiveChartsCore.RadialAlignment.Center:
                    relativeOuterRadius = dw * 0.5;
                    relativeInnerRadius = dw * 0.5;
                    break;
                case LiveChartsCore.RadialAlignment.Inner:
                    relativeOuterRadius = dw;
                    relativeInnerRadius = 0;
                    break;
                default:
                    throw new System.NotImplementedException(`The alignment ${this.RadialAlign} is not supported.`);
            }
        }

        let r = <number><unknown>this.DataLabelsRotation;
        let isTangent = false;
        let isCotangent = false;

        if (((Math.floor(r) & 0xFFFFFFFF) & LiveChartsCore.LiveCharts.TangentAngle) != 0) {
            r -= LiveChartsCore.LiveCharts.TangentAngle;
            isTangent = true;
        }

        if (((Math.floor(r) & 0xFFFFFFFF) & LiveChartsCore.LiveCharts.CotangentAngle) != 0) {
            r -= LiveChartsCore.LiveCharts.CotangentAngle;
            isCotangent = true;
        }

        let i = 1;
        let isClockWise = view.IsClockwise;

        for (const point of fetched) {
            let visual = point.Context.Visual as TVisual;

            if (point.IsEmpty) {
                if (visual != null) {
                    visual.CenterX = cx;
                    visual.CenterY = cy;
                    visual.X = cx;
                    visual.Y = cy;
                    visual.Width = 0;
                    visual.Height = 0;
                    visual.SweepAngle = 0;
                    visual.StartAngle = initialRotation;
                    visual.PushOut = 0;
                    visual.InnerRadius = 0;
                    visual.CornerRadius = 0;
                    visual.RemoveOnCompleted = true;
                    point.Context.Visual = null;
                }

                let md2 = minDimension;
                let w2 = md2 - (md2 - 2 * innerRadius) * (fetched.length - i) / fetched.length - relativeOuterRadius * 2;
                stackedInnerRadius = (w2 + relativeOuterRadius * 2) * 0.5;
                i++;
                continue;
            }

            let stack = stacker.GetStack(point);
            let stackedValue = stack.Start;
            let total = chartTotal ?? stack.Total;

            let start: number = 0;
            let sweep: number = 0;

            if (total == 0) {
                start = 0;
                sweep = 0;
            } else {
                start = stackedValue / total * completeAngle;
                sweep = (stackedValue + point.PrimaryValue) / total * completeAngle - start;
                if (!isClockWise) start = completeAngle - start - sweep;
            }

            if (this.IsFillSeries) {
                start = 0;
                sweep = completeAngle - 0.1;
            }

            if (visual == null) {
                // var p = new TVisual
                // {
                //     CenterX = cx,
                //     CenterY = cy,
                //     X = cx,
                //     Y = cy,
                //     Width = 0,
                //     Height = 0,
                //     StartAngle = (float)(pieChart.IsFirstDraw ? initialRotation : start + initialRotation),
                //     SweepAngle = 0,
                //     PushOut = 0,
                //     InnerRadius = 0,
                //     CornerRadius = 0
                // };
                let p = this._visualFactory();
                p.CenterX = cx;
                p.CenterY = cy;
                p.X = cx;
                p.Y = cy;
                p.Width = 0;
                p.Height = 0;
                p.StartAngle = <number><unknown>(pieChart.IsFirstDraw ? initialRotation : start + initialRotation);
                p.SweepAngle = 0;
                p.PushOut = 0;
                p.InnerRadius = 0;
                p.CornerRadius = 0;

                visual = p;
                point.Context.Visual = visual;
                this.OnPointCreated(point);
                this.everFetched.Add(point);
            }

            this.Fill?.AddGeometryToPaintTask(pieChart.Canvas, visual);
            this.Stroke?.AddGeometryToPaintTask(pieChart.Canvas, visual);

            let dougnutGeometry = visual;

            stackedInnerRadius += relativeInnerRadius;

            let md = minDimension;
            let w = md - (md - 2 * innerRadius) * (fetched.length - i) / fetched.length - relativeOuterRadius * 2;

            let x = (drawMarginSize.Width - w) * 0.5;

            dougnutGeometry.CenterX = cx;
            dougnutGeometry.CenterY = cy;
            dougnutGeometry.X = drawLocation.X + x;
            dougnutGeometry.Y = drawLocation.Y + (drawMarginSize.Height - w) * 0.5;
            dougnutGeometry.Width = w;
            dougnutGeometry.Height = w;
            dougnutGeometry.InnerRadius = stackedInnerRadius;
            dougnutGeometry.PushOut = pushout;
            dougnutGeometry.StartAngle = <number><unknown>(start + initialRotation);
            dougnutGeometry.SweepAngle = <number><unknown>sweep;
            dougnutGeometry.CornerRadius = cornerRadius;
            dougnutGeometry.InvertedCornerRadius = this.InvertedCornerRadius;
            dougnutGeometry.RemoveOnCompleted = false;

            if (start + initialRotation == initialRotation && sweep == 360)
                dougnutGeometry.SweepAngle = 359.99;

            let ha: LiveChartsCore.SemicircleHoverArea;
            if (point.Context.HoverArea instanceof LiveChartsCore.SemicircleHoverArea)
                ha = (point.Context.HoverArea as LiveChartsCore.SemicircleHoverArea)!;
            else
                point.Context.HoverArea = ha = new LiveChartsCore.SemicircleHoverArea();
            ha.SetDimensions(cx, cy, <number><unknown>(start + initialRotation), <number><unknown>(start + initialRotation + sweep), md * 0.5);

            pointsCleanup.Clean(point);

            if (this.DataLabelsPaint != null && point.PrimaryValue >= 0) {
                let label = <Nullable<TLabel>><unknown>point.Context.Label;

                // middleAngle = startAngle + (sweepAngle/2);
                let middleAngle = <number><unknown>(start + initialRotation + sweep * 0.5);

                let actualRotation = r +
                    (isTangent ? middleAngle - 90 : 0) +
                    (isCotangent ? middleAngle : 0);

                if ((isTangent || isCotangent) && ((actualRotation + 90) % 360) > 180)
                    actualRotation += 180;

                if (label == null) {
                    //var l = new TLabel { X = cx, Y = cy, RotateTransform = actualRotation };
                    let l = this._labelFactory();
                    l.X = cx;
                    l.Y = cy;
                    l.RotateTransform = actualRotation;
                    LiveChartsCore.Extensions.TransitionateProperties(l, "X", "Y")
                        .WithAnimationBuilder(animation =>
                            animation
                                .WithDuration(this.AnimationsSpeed ?? pieChart.AnimationsSpeed)
                                .WithEasingFunction(this.EasingFunction ?? pieChart.EasingFunction));

                    l.CompleteTransition();
                    label = l;
                    point.Context.Label = l;
                }

                this.DataLabelsPaint.AddGeometryToPaintTask(pieChart.Canvas, label);

                label.Text = this.DataLabelsFormatter(new LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>(point));
                label.TextSize = dls;
                label.Padding = this.DataLabelsPadding;
                label.RotateTransform = actualRotation;

                if (this.DataLabelsPosition == LiveChartsCore.PolarLabelsPosition.Start) {
                    let a = start + initialRotation;
                    a %= 360;
                    if (a < 0) a += 360;
                    let c = 90;

                    if (a > 180) c = -90;

                    label.HorizontalAlign = a > 180 ? LiveChartsCore.Align.End : LiveChartsCore.Align.Start;
                    label.RotateTransform = <number><unknown>(a - c);
                }

                if (this.DataLabelsPosition == LiveChartsCore.PolarLabelsPosition.End) {
                    let a = start + initialRotation + sweep;
                    a %= 360;
                    if (a < 0) a += 360;
                    let c = 90;

                    if (a > 180) c = -90;

                    label.HorizontalAlign = a > 180 ? LiveChartsCore.Align.Start : LiveChartsCore.Align.End;
                    label.RotateTransform = <number><unknown>(a - c);
                }

                if (this.DataLabelsPosition == LiveChartsCore.PolarLabelsPosition.Outer) {
                    let a = start + initialRotation + sweep * 0.5;
                    let mod = a % 360;
                    let isStart = mod < 90 || (mod > 270 && mod < 360);
                    label.HorizontalAlign = label.HorizontalAlign = isStart ? LiveChartsCore.Align.Start : LiveChartsCore.Align.End;
                }

                let labelPosition = this.GetLabelPolarPosition(
                    cx, cy, ((w + relativeOuterRadius * 2) * 0.5 + stackedInnerRadius) * 0.5,
                    stackedInnerRadius, <number><unknown>(start + initialRotation), <number><unknown>sweep,
                    label.Measure(this.DataLabelsPaint), this.DataLabelsPosition);

                label.X = labelPosition.X;
                label.Y = labelPosition.Y;
            }

            this.OnPointMeasured(point);

            stackedInnerRadius = (w + relativeOuterRadius * 2) * 0.5;
            i++;
        }

        let u = LiveChartsCore.Scaler.MakeDefault(); // dummy scaler, this is not used in the SoftDeleteOrDisposePoint method.
        pointsCleanup.CollectPoints(this.everFetched, pieChart.View, u, u, this.SoftDeleteOrDisposePoint.bind(this));
    }

    public GetBounds(chart: LiveChartsCore.PieChart<TDrawingContext>): LiveChartsCore.DimensionalBounds {
        return this.DataFactory.GetPieBounds(chart, this).Bounds;
    }

    GetMiniatresSketch(): LiveChartsCore.Sketch<TDrawingContext> {
        let schedules = new System.List<LiveChartsCore.PaintSchedule<TDrawingContext>>();

        if (this.Fill != null) schedules.Add(this.BuildMiniatureSchedule(this.Fill, this._miniatureGeometryFactory()));
        if (this.Stroke != null) schedules.Add(this.BuildMiniatureSchedule(this.Stroke, this._miniatureGeometryFactory()));

        return new LiveChartsCore.Sketch<TDrawingContext>().Init(
            {
                Height: this.MiniatureShapeSize,
                Width: this.MiniatureShapeSize,
                PaintSchedules: schedules
            });
    }

    GetStackGroup(): number {
        return 0;
    }

    GetPaintTasks(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>[] {
        return [this._fill, this._stroke, this.DataLabelsPaint, this.hoverPaint];
    }

    WhenPointerEnters(point: LiveChartsCore.ChartPoint) {
        super.WhenPointerEnters(point);

        let visual = <Nullable<TVisual>><unknown>point.Context.Visual;
        if (visual == null || visual.MainGeometry == null) return;
        visual.PushOut = <number><unknown>this.HoverPushout;
    }

    WhenPointerLeaves(point: LiveChartsCore.ChartPoint) {
        super.WhenPointerLeaves(point);

        let visual = <Nullable<TVisual>><unknown>point.Context.Visual;
        if (visual == null || visual.MainGeometry == null) return;
        visual.PushOut = <number><unknown>this.Pushout;
    }

    MiniatureEquals(instance: LiveChartsCore.IChartSeries<TDrawingContext>): boolean {
        if (instance instanceof PieSeries<TModel, TVisual, TLabel, TMiniatureGeometry, TDrawingContext>) {
            const pieSeries = instance;
            return this.Name == pieSeries.Name && this.Fill == pieSeries.Fill && this.Stroke == pieSeries.Stroke;
        }
        return false;
    }

    SetDefaultPointTransitions(chartPoint: LiveChartsCore.ChartPoint) {
        if (this.IsFillSeries) return;

        let isGauge = (this.SeriesProperties & LiveChartsCore.SeriesProperties.Gauge) == LiveChartsCore.SeriesProperties.Gauge;

        let chart = chartPoint.Context.Chart;

        let visual = (chartPoint.Context.Visual as TVisual)!;
        LiveChartsCore.Extensions.TransitionateProperties(
            visual
            , "StartAngle",
            "SweepAngle",
            "PushOut")
            .WithAnimationBuilder(animation =>
                animation
                    .WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed)
                    .WithEasingFunction(this.EasingFunction ?? chart.EasingFunction))
            .CompleteCurrentTransitions();

        if ((this.SeriesProperties & LiveChartsCore.SeriesProperties.Gauge) == 0)
            LiveChartsCore.Extensions.TransitionateProperties(
                visual
                , "CenterX",
                "CenterY",
                "X",
                "Y",
                "InnerRadius",
                "Width",
                "Height")
                .WithAnimationBuilder(animation =>
                    animation
                        .WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed)
                        .WithEasingFunction(this.EasingFunction ?? chart.EasingFunction))
                .CompleteCurrentTransitions();
    }

    protected SoftDeleteOrDisposePoint(point: LiveChartsCore.ChartPoint, primaryScale: LiveChartsCore.Scaler, secondaryScale: LiveChartsCore.Scaler) {
        let visual = <Nullable<TVisual>><unknown>point.Context.Visual;
        if (visual == null) return;
        if (this.DataFactory == null) throw new System.Exception("Data provider not found");

        visual.StartAngle += visual.SweepAngle;
        visual.SweepAngle = 0;
        visual.CornerRadius = 0;
        visual.RemoveOnCompleted = true;

        this.DataFactory.DisposePoint(point);

        let label = <Nullable<TLabel>><unknown>point.Context.Label;
        if (label == null) return;

        label.TextSize = 1;
        label.RemoveOnCompleted = true;
    }

    protected GetLabelPolarPosition(centerX: number,
                                    centerY: number,
                                    radius: number,
                                    innerRadius: number,
                                    startAngle: number,
                                    sweepAngle: number,
                                    labelSize: LiveChartsCore.LvcSize,
                                    position: LiveChartsCore.PolarLabelsPosition): LiveChartsCore.LvcPoint {
        let toRadians: number = <number><unknown>(Math.PI / 180);
        let angle: number = 0;

        switch (position) {
            case LiveChartsCore.PolarLabelsPosition.End:
                angle = startAngle + sweepAngle;
                break;
            case LiveChartsCore.PolarLabelsPosition.Start:
                angle = startAngle;
                break;
            case LiveChartsCore.PolarLabelsPosition.Outer:
                angle = startAngle + sweepAngle * 0.5;
                radius += radius - innerRadius;
                break;
            case LiveChartsCore.PolarLabelsPosition.Middle:
                angle = startAngle + sweepAngle * 0.5;
                break;
            case LiveChartsCore.PolarLabelsPosition.ChartCenter:
                return new LiveChartsCore.LvcPoint(centerX, centerY);
            default:
                break;
        }

        //angle %= 360;
        //if (angle < 0) angle += 360;
        angle *= toRadians;

        return new LiveChartsCore.LvcPoint(<number><unknown>(centerX + Math.cos(angle) * radius),
            <number><unknown>(centerY + Math.sin(angle) * radius));
    }

    SoftDeleteOrDispose(chart: LiveChartsCore.IChartView) {
        let core = (<LiveChartsCore.IPieChartView<TDrawingContext>><unknown>chart).Core;
        let u = LiveChartsCore.Scaler.MakeDefault();

        let toDelete = new System.List<LiveChartsCore.ChartPoint>();
        for (const point of this.everFetched) {
            if (point.Context.Chart != chart) continue;
            this.SoftDeleteOrDisposePoint(point, u, u);
            toDelete.Add(point);
        }

        for (const pt of this.GetPaintTasks()) {
            if (pt != null) core.Canvas.RemovePaintTask(pt);
        }

        for (const item of toDelete) this.everFetched.Remove(item);

        this.OnVisibilityChanged();
    }
}
