import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class LineSeries<TModel, TVisual extends object & LiveChartsCore.ISizedVisualChartPoint<TDrawingContext>, TLabel extends object & LiveChartsCore.ILabelGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext, TPathGeometry extends LiveChartsCore.IVectorGeometry<LiveChartsCore.CubicBezierSegment, TDrawingContext>, TVisualPoint extends LiveChartsCore.BezierVisualPoint<TDrawingContext, TVisual>> extends LiveChartsCore.StrokeAndFillCartesianSeries<TModel, TVisualPoint, TLabel, TDrawingContext> implements LiveChartsCore.ILineSeries<TDrawingContext> {
    public readonly _fillPathHelperDictionary: System.Dictionary<any, System.List<TPathGeometry>> = new System.Dictionary();
    public readonly _strokePathHelperDictionary: System.Dictionary<any, System.List<TPathGeometry>> = new System.Dictionary();
    private _lineSmoothness: number = 0.65;
    private _geometrySize: number = 14;
    private _enableNullSplitting: boolean = true;
    private _geometryFill: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _geometryStroke: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    private readonly _visualPointFactory: System.Func1<TVisualPoint>;
    private readonly _pathGeometryFactory: System.Func1<TPathGeometry>;
    private readonly _visualFactory: System.Func1<TVisual>;
    private readonly _labelFactory: System.Func1<TLabel>;

    protected constructor(visualFactory: System.Func1<TVisual>, labelFactory: System.Func1<TLabel>,
                          pathGeometryFactory: System.Func1<TPathGeometry>, visualPointFactory: System.Func1<TVisualPoint>, isStacked: boolean = false) {
        super(LiveChartsCore.SeriesProperties.Line | LiveChartsCore.SeriesProperties.PrimaryAxisVerticalOrientation |
            (isStacked ? LiveChartsCore.SeriesProperties.Stacked : 0) | LiveChartsCore.SeriesProperties.Sketch | LiveChartsCore.SeriesProperties.PrefersXStrategyTooltips);
        this._visualPointFactory = visualPointFactory;
        this._pathGeometryFactory = pathGeometryFactory;
        this._visualFactory = visualFactory;
        this._labelFactory = labelFactory;
        this.DataPadding = new LiveChartsCore.LvcPoint(0.5, 1);
    }

    public get GeometrySize(): number {
        return this._geometrySize;
    }

    public set GeometrySize(value: number) {
        this.SetProperty(new System.Ref(() => this._geometrySize, $v => this._geometrySize = $v), <number><unknown>value);
    }

    public get LineSmoothness(): number {
        return this._lineSmoothness;
    }

    public set LineSmoothness(value: number) {
        let v = value;
        if (value > 1) v = 1;
        if (value < 0) v = 0;
        this.SetProperty(new System.Ref(() => this._lineSmoothness, $v => this._lineSmoothness = $v), <number><unknown>v);
    }

    public get EnableNullSplitting(): boolean {
        return this._enableNullSplitting;
    }

    public set EnableNullSplitting(value: boolean) {
        this.SetProperty(new System.Ref(() => this._enableNullSplitting, $v => this._enableNullSplitting = $v), value);
    }

    public get GeometryFill(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._geometryFill;
    }

    public set GeometryFill(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._geometryFill, $v => this._geometryFill = $v), value);
    }

    public get GeometryStroke(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._geometryStroke;
    }

    public set GeometryStroke(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._geometryStroke, $v => this._geometryStroke = $v), value, true);
    }

    Invalidate(chart: LiveChartsCore.Chart<TDrawingContext>) {
        let strokePathHelperContainer: any;
        let fillPathHelperContainer: any;
        let cartesianChart = <LiveChartsCore.CartesianChart<TDrawingContext>><unknown>chart;
        let primaryAxis = cartesianChart.YAxes[this.ScalesYAt];
        let secondaryAxis = cartesianChart.XAxes[this.ScalesXAt];

        let drawLocation = (cartesianChart.DrawMarginLocation).Clone();
        let drawMarginSize = (cartesianChart.DrawMarginSize).Clone();
        let secondaryScale = LiveChartsCore.Extensions.GetNextScaler(secondaryAxis, cartesianChart);
        let primaryScale = LiveChartsCore.Extensions.GetNextScaler(primaryAxis, cartesianChart);
        let actualSecondaryScale = LiveChartsCore.Extensions.GetActualScaler(secondaryAxis, cartesianChart);
        let actualPrimaryScale = LiveChartsCore.Extensions.GetActualScaler(primaryAxis, cartesianChart);

        let gs = this._geometrySize;
        let hgs = gs / 2;
        let sw = this.Stroke?.StrokeThickness ?? 0;
        let p = primaryScale.ToPixels(this.pivot);

        // Note #240222
        // the following cases probably have a similar performance impact
        // this options were necessary at some older point when _enableNullSplitting = false could improve performance
        // ToDo: Check this out, maybe this is unnecessary now and we should just go for the first approach all the times.
        let segments = this._enableNullSplitting
            ? LiveChartsCore.Extensions.SplitByNullGaps(this.Fetch(cartesianChart), point => this.DeleteNullPoint(point, secondaryScale, primaryScale)) // calling this method is probably as expensive as the line bellow
            : new System.List<System.IEnumerable<LiveChartsCore.ChartPoint>>().Init([this.Fetch(cartesianChart)]);

        let stacker = (this.SeriesProperties & LiveChartsCore.SeriesProperties.Stacked) == LiveChartsCore.SeriesProperties.Stacked
            ? cartesianChart.SeriesContext.GetStackPosition(this, this.GetStackGroup())
            : null;

        let actualZIndex = this.ZIndex == 0 ? (<LiveChartsCore.ISeries><unknown>this).SeriesId : this.ZIndex;

        if (stacker != null) {
            // Note# 010621
            // easy workaround to set an automatic and valid z-index for stacked area series
            // the problem of this solution is that the user needs to set z-indexes above 1000
            // if the user needs to add more series to the chart.
            actualZIndex = 1000 - stacker.Position;
            if (this.Fill != null) this.Fill.ZIndex = actualZIndex;
            if (this.Stroke != null) this.Stroke.ZIndex = actualZIndex;
        }

        let dls = <number><unknown>this.DataLabelsSize;
        let pointsCleanup = LiveChartsCore.ChartPointCleanupContext.For(this.everFetched);

        if (!this._strokePathHelperDictionary.TryGetValue(chart.Canvas.Sync, new System.Out(() => strokePathHelperContainer, $v => strokePathHelperContainer = $v))) {
            strokePathHelperContainer = new System.List<TPathGeometry>();
            this._strokePathHelperDictionary.SetAt(chart.Canvas.Sync, strokePathHelperContainer);
        }

        if (!this._fillPathHelperDictionary.TryGetValue(chart.Canvas.Sync, new System.Out(() => fillPathHelperContainer, $v => fillPathHelperContainer = $v))) {
            fillPathHelperContainer = new System.List<TPathGeometry>();
            this._fillPathHelperDictionary.SetAt(chart.Canvas.Sync, fillPathHelperContainer);
        }

        let uwx = secondaryScale.MeasureInPixels(secondaryAxis.UnitWidth);
        uwx = uwx < gs ? gs : uwx;

        let segmentI = 0;

        for (const segment of segments) {
            let fillPath: TPathGeometry;
            let strokePath: TPathGeometry;
            let isNew = false;

            if (segmentI >= fillPathHelperContainer.length) {
                isNew = true;
                fillPath = this._pathGeometryFactory(); //new TPathGeometry { ClosingMethod = VectorClosingMethod.CloseToPivot };
                fillPath.ClosingMethod = LiveChartsCore.VectorClosingMethod.CloseToPivot;
                fillPathHelperContainer.Add(fillPath);
            } else {
                fillPath = fillPathHelperContainer[segmentI];
            }

            if (segmentI >= strokePathHelperContainer.length) {
                isNew = true;
                strokePath = this._pathGeometryFactory(); //new TPathGeometry { ClosingMethod = VectorClosingMethod.NotClosed };
                strokePath.ClosingMethod = LiveChartsCore.VectorClosingMethod.NotClosed;
                strokePathHelperContainer.Add(strokePath);
            } else {
                strokePath = strokePathHelperContainer[segmentI];
            }

            let strokeVector = new LiveChartsCore.VectorManager<LiveChartsCore.CubicBezierSegment, TDrawingContext>(strokePath);
            let fillVector = new LiveChartsCore.VectorManager<LiveChartsCore.CubicBezierSegment, TDrawingContext>(fillPath);

            if (this.Fill != null) {
                this.Fill.AddGeometryToPaintTask(cartesianChart.Canvas, fillPath);
                cartesianChart.Canvas.AddDrawableTask(this.Fill);
                this.Fill.ZIndex = actualZIndex + 0.1;
                this.Fill.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
                fillPath.Pivot = p;
                if (isNew) {
                    LiveChartsCore.Extensions.TransitionateProperties(fillPath, "fillPath.Pivot")
                        .WithAnimationBuilder(animation =>
                            animation
                                .WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed)
                                .WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction))
                        .CompleteCurrentTransitions();
                }
            }
            if (this.Stroke != null) {
                this.Stroke.AddGeometryToPaintTask(cartesianChart.Canvas, strokePath);
                cartesianChart.Canvas.AddDrawableTask(this.Stroke);
                this.Stroke.ZIndex = actualZIndex + 0.2;
                this.Stroke.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
                strokePath.Pivot = p;
                if (isNew) {
                    LiveChartsCore.Extensions.TransitionateProperties(strokePath, "strokePath.Pivot")
                        .WithAnimationBuilder(animation =>
                            animation
                                .WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed)
                                .WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction))
                        .CompleteCurrentTransitions();
                }
            }

            let isSegmentEmpty = true;

            for (const data of this.GetSpline(segment, stacker)) {
                isSegmentEmpty = false;
                let s = 0;
                if (stacker != null)
                    s = data.TargetPoint.PrimaryValue > 0
                        ? stacker.GetStack(data.TargetPoint).Start
                        : stacker.GetStack(data.TargetPoint).NegativeStart;

                let visual = <Nullable<TVisualPoint>><unknown>data.TargetPoint.Context.Visual;

                if (visual == null) {
                    let v = this._visualPointFactory(); //new TVisualPoint();
                    visual = v;

                    if (this.IsFirstDraw) {
                        v.Geometry.X = secondaryScale.ToPixels(data.TargetPoint.SecondaryValue);
                        v.Geometry.Y = p;
                        v.Geometry.Width = 0;
                        v.Geometry.Height = 0;

                        v.Bezier.Xi = secondaryScale.ToPixels(data.X0);
                        v.Bezier.Xm = secondaryScale.ToPixels(data.X1);
                        v.Bezier.Xj = secondaryScale.ToPixels(data.X2);
                        v.Bezier.Yi = p;
                        v.Bezier.Ym = p;
                        v.Bezier.Yj = p;
                    }

                    data.TargetPoint.Context.Visual = v;
                    this.OnPointCreated(data.TargetPoint);
                }
                this.everFetched.Add(data.TargetPoint);

                this.GeometryFill?.AddGeometryToPaintTask(cartesianChart.Canvas, visual.Geometry);
                this.GeometryStroke?.AddGeometryToPaintTask(cartesianChart.Canvas, visual.Geometry);

                visual.Bezier.Id = data.TargetPoint.Context.Entity.EntityIndex;

                if (this.Fill != null) fillVector.AddConsecutiveSegment(visual.Bezier, !this.IsFirstDraw);
                if (this.Stroke != null) strokeVector.AddConsecutiveSegment(visual.Bezier, !this.IsFirstDraw);

                visual.Bezier.Xi = secondaryScale.ToPixels(data.X0);
                visual.Bezier.Xm = secondaryScale.ToPixels(data.X1);
                visual.Bezier.Xj = secondaryScale.ToPixels(data.X2);
                visual.Bezier.Yi = primaryScale.ToPixels(data.Y0);
                visual.Bezier.Ym = primaryScale.ToPixels(data.Y1);
                visual.Bezier.Yj = primaryScale.ToPixels(data.Y2);

                let x = secondaryScale.ToPixels(data.TargetPoint.SecondaryValue);
                let y = primaryScale.ToPixels(data.TargetPoint.PrimaryValue + s);

                visual.Geometry.MotionProperties.GetAt("visual.Geometry.X").CopyFrom(visual.Bezier.MotionProperties.GetAt("visual.Bezier.Xj"));
                visual.Geometry.MotionProperties.GetAt("visual.Geometry.Y").CopyFrom(visual.Bezier.MotionProperties.GetAt("visual.Bezier.Yj"));
                visual.Geometry.TranslateTransform = new LiveChartsCore.LvcPoint(-hgs, -hgs);

                visual.Geometry.Width = gs;
                visual.Geometry.Height = gs;
                visual.Geometry.RemoveOnCompleted = false;

                visual.FillPath = fillPath;
                visual.StrokePath = strokePath;

                let hags = gs < 8 ? 8 : gs;

                let ha: LiveChartsCore.RectangleHoverArea;
                if (data.TargetPoint.Context.HoverArea instanceof LiveChartsCore.RectangleHoverArea)
                    ha = (data.TargetPoint.Context.HoverArea as LiveChartsCore.RectangleHoverArea)!;
                else
                    data.TargetPoint.Context.HoverArea = ha = new LiveChartsCore.RectangleHoverArea();
                ha.SetDimensions(x - uwx * 0.5, y - hgs, uwx, gs);

                pointsCleanup.Clean(data.TargetPoint);

                if (this.DataLabelsPaint != null) {
                    let label = <Nullable<TLabel>><unknown>data.TargetPoint.Context.Label;

                    if (label == null) {
                        //var l = new TLabel { X = x - hgs, Y = p - hgs, RotateTransform = (float)DataLabelsRotation };
                        let l = this._labelFactory();
                        l.X = x - hgs;
                        l.Y = p - hgs;
                        l.RotateTransform = <number><unknown>this.DataLabelsRotation;
                        LiveChartsCore.Extensions.TransitionateProperties(l, "l.X", "l.Y")
                            .WithAnimationBuilder(animation =>
                                animation
                                    .WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed)
                                    .WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));

                        l.CompleteTransition(null);
                        label = l;
                        data.TargetPoint.Context.Label = l;
                    }

                    this.DataLabelsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, label);
                    label.Text = this.DataLabelsFormatter(new LiveChartsCore.ChartPoint3<TModel, TVisualPoint, TLabel>(data.TargetPoint));
                    label.TextSize = dls;
                    label.Padding = this.DataLabelsPadding;
                    let m = label.Measure(this.DataLabelsPaint);
                    let labelPosition = this.GetLabelPosition(
                        x - hgs, y - hgs, gs, gs, (m).Clone(), this.DataLabelsPosition,
                        this.SeriesProperties, data.TargetPoint.PrimaryValue > this.Pivot, (drawLocation).Clone(), (drawMarginSize).Clone());
                    if (this.DataLabelsTranslate != null) label.TranslateTransform =
                        new LiveChartsCore.LvcPoint(m.Width * this.DataLabelsTranslate.X, m.Height * this.DataLabelsTranslate.Y);

                    label.X = labelPosition.X;
                    label.Y = labelPosition.Y;
                }

                this.OnPointMeasured(data.TargetPoint);
            }

            strokeVector.End();
            fillVector.End();

            if (this.GeometryFill != null) {
                cartesianChart.Canvas.AddDrawableTask(this.GeometryFill);
                this.GeometryFill.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
                this.GeometryFill.ZIndex = actualZIndex + 0.3;
            }
            if (this.GeometryStroke != null) {
                cartesianChart.Canvas.AddDrawableTask(this.GeometryStroke);
                this.GeometryStroke.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
                this.GeometryStroke.ZIndex = actualZIndex + 0.4;
            }

            if (!isSegmentEmpty) segmentI++;
        }

        let maxSegment = fillPathHelperContainer.length > strokePathHelperContainer.length
            ? fillPathHelperContainer.length
            : strokePathHelperContainer.length;

        for (let i = maxSegment - 1; i >= segmentI; i--) {
            if (i < fillPathHelperContainer.length) {
                let segmentFill = fillPathHelperContainer[i];
                this.Fill?.RemoveGeometryFromPainTask(cartesianChart.Canvas, segmentFill);
                segmentFill.ClearCommands();
                fillPathHelperContainer.RemoveAt(i);
            }

            if (i < strokePathHelperContainer.length) {
                let segmentStroke = strokePathHelperContainer[i];
                this.Stroke?.RemoveGeometryFromPainTask(cartesianChart.Canvas, segmentStroke);
                segmentStroke.ClearCommands();
                strokePathHelperContainer.RemoveAt(i);
            }
        }

        if (this.DataLabelsPaint != null) {
            cartesianChart.Canvas.AddDrawableTask(this.DataLabelsPaint);
            //DataLabelsPaint.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation, drawMarginSize));
            this.DataLabelsPaint.ZIndex = actualZIndex + 0.5;
        }

        pointsCleanup.CollectPoints(
            this.everFetched, cartesianChart.View, primaryScale, secondaryScale, this.SoftDeleteOrDisposePoint.bind(this));

        this.IsFirstDraw = false;
    }

    GetRequestedGeometrySize(): number {
        return (this.GeometrySize + (this.GeometryStroke?.StrokeThickness ?? 0)) * 0.5;
    }

    MiniatureEquals(series: LiveChartsCore.IChartSeries<TDrawingContext>): boolean {
        if (series instanceof LineSeries<TModel, TVisual, TLabel, TDrawingContext, TPathGeometry, TVisualPoint>) {
            const lineSeries = series;
            return this.Name == series.Name &&
                !(<LiveChartsCore.ISeries><unknown>this).PaintsChanged &&
                this.Fill == lineSeries.Fill && this.Stroke == lineSeries.Stroke &&
                this.GeometryFill == lineSeries.GeometryFill && this.GeometryStroke == lineSeries.GeometryStroke;
        }
        return false;
    }

    GetMiniatresSketch(): LiveChartsCore.Sketch<TDrawingContext> {
        let schedules = new System.List<LiveChartsCore.PaintSchedule<TDrawingContext>>();

        if (this.GeometryFill != null) schedules.Add(this.BuildMiniatureSchedule(this.GeometryFill, this._visualFactory()));
        else if (this.Fill != null) schedules.Add(this.BuildMiniatureSchedule(this.Fill, this._visualFactory()));

        if (this.GeometryStroke != null) schedules.Add(this.BuildMiniatureSchedule(this.GeometryStroke, this._visualFactory()));
        else if (this.Stroke != null) schedules.Add(this.BuildMiniatureSchedule(this.Stroke, this._visualFactory()));

        return new LiveChartsCore.Sketch<TDrawingContext>().Init(
            {
                Height: this.MiniatureShapeSize,
                Width: this.MiniatureShapeSize,
                PaintSchedules: schedules
            });
    }

    SoftDeleteOrDispose(chart: LiveChartsCore.IChartView) {
        super.SoftDeleteOrDispose(chart);
        let canvas = (<LiveChartsCore.ICartesianChartView<TDrawingContext>><unknown>chart).CoreCanvas;

        if (this.Fill != null) {
            for (const activeChartContainer of this._fillPathHelperDictionary)
                for (const pathHelper of activeChartContainer.Value)
                    this.Fill.RemoveGeometryFromPainTask(canvas, pathHelper);
        }

        if (this.Stroke != null) {
            for (const activeChartContainer of this._strokePathHelperDictionary)
                for (const pathHelper of activeChartContainer.Value)
                    this.Stroke.RemoveGeometryFromPainTask(canvas, pathHelper);
        }

        if (this.GeometryFill != null) canvas.RemovePaintTask(this.GeometryFill);
        if (this.GeometryStroke != null) canvas.RemovePaintTask(this.GeometryStroke);
    }

    RemoveFromUI(chart: LiveChartsCore.Chart<TDrawingContext>) {
        super.RemoveFromUI(chart);
        this._fillPathHelperDictionary.Remove(chart.Canvas.Sync);
        this._strokePathHelperDictionary.Remove(chart.Canvas.Sync);
    }

    GetPaintTasks(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>[] {
        return [this.Stroke, this.Fill, this._geometryFill, this._geometryStroke, this.DataLabelsPaint, this.hoverPaint];
    }

    public GetSpline(points: System.IEnumerable<LiveChartsCore.ChartPoint>,
                     stacker: Nullable<LiveChartsCore.StackPosition<TDrawingContext>>): System.IEnumerable<LiveChartsCore.BezierData> {
        const _$generator = function* (this: any, points: System.IEnumerable<LiveChartsCore.ChartPoint>,
                                       stacker: Nullable<LiveChartsCore.StackPosition<TDrawingContext>>) {
            for (const item of LiveChartsCore.Extensions.AsSplineData(points,)) {
                if (item.IsFirst) {
                    let c = item.Current;

                    let sc = (item.Current.PrimaryValue > 0
                        ? stacker?.GetStack(c).Start
                        : stacker?.GetStack(c).NegativeStart) ?? 0;

                    yield new LiveChartsCore.BezierData(item.Next).Init(
                        {
                            X0: c.SecondaryValue,
                            Y0: c.PrimaryValue + sc,
                            X1: c.SecondaryValue,
                            Y1: c.PrimaryValue + sc,
                            X2: c.SecondaryValue,
                            Y2: c.PrimaryValue + sc
                        });

                    continue;
                }

                let pys = 0;
                let cys = 0;
                let nys = 0;
                let nnys = 0;

                if (stacker != null) {
                    pys = item.Previous.PrimaryValue > 0 ? stacker.GetStack(item.Previous).Start : stacker.GetStack(item.Previous).NegativeStart;
                    cys = item.Current.PrimaryValue > 0 ? stacker.GetStack(item.Current).Start : stacker.GetStack(item.Current).NegativeStart;
                    nys = item.Next.PrimaryValue > 0 ? stacker.GetStack(item.Next).Start : stacker.GetStack(item.Next).NegativeStart;
                    nnys = item.AfterNext.PrimaryValue > 0 ? stacker.GetStack(item.AfterNext).Start : stacker.GetStack(item.AfterNext).NegativeStart;
                }

                let xc1 = (item.Previous.SecondaryValue + item.Current.SecondaryValue) / 2.0;
                let yc1 = (item.Previous.PrimaryValue + pys + item.Current.PrimaryValue + cys) / 2.0;
                let xc2 = (item.Current.SecondaryValue + item.Next.SecondaryValue) / 2.0;
                let yc2 = (item.Current.PrimaryValue + cys + item.Next.PrimaryValue + nys) / 2.0;
                let xc3 = (item.Next.SecondaryValue + item.AfterNext.SecondaryValue) / 2.0;
                let yc3 = (item.Next.PrimaryValue + nys + item.AfterNext.PrimaryValue + nnys) / 2.0;

                let len1 = <number><unknown>Math.sqrt((item.Current.SecondaryValue - item.Previous.SecondaryValue) *
                    (item.Current.SecondaryValue - item.Previous.SecondaryValue) +
                    (item.Current.PrimaryValue + cys - item.Previous.PrimaryValue + pys) * (item.Current.PrimaryValue + cys - item.Previous.PrimaryValue + pys));
                let len2 = <number><unknown>Math.sqrt((item.Next.SecondaryValue - item.Current.SecondaryValue) *
                    (item.Next.SecondaryValue - item.Current.SecondaryValue) +
                    (item.Next.PrimaryValue + nys - item.Current.PrimaryValue + cys) * (item.Next.PrimaryValue + nys - item.Current.PrimaryValue + cys));
                let len3 = <number><unknown>Math.sqrt((item.AfterNext.SecondaryValue - item.Next.SecondaryValue) *
                    (item.AfterNext.SecondaryValue - item.Next.SecondaryValue) +
                    (item.AfterNext.PrimaryValue + nnys - item.Next.PrimaryValue + nys) * (item.AfterNext.PrimaryValue + nnys - item.Next.PrimaryValue + nys));

                let k1 = len1 / (len1 + len2);
                let k2 = len2 / (len2 + len3);

                if (Number.isNaN(k1)) k1 = 0;
                if (Number.isNaN(k2)) k2 = 0;

                let xm1 = xc1 + (xc2 - xc1) * k1;
                let ym1 = yc1 + (yc2 - yc1) * k1;
                let xm2 = xc2 + (xc3 - xc2) * k2;
                let ym2 = yc2 + (yc3 - yc2) * k2;

                let c1X = xm1 + (xc2 - xm1) * this._lineSmoothness + item.Current.SecondaryValue - xm1;
                let c1Y = ym1 + (yc2 - ym1) * this._lineSmoothness + item.Current.PrimaryValue + cys - ym1;
                let c2X = xm2 + (xc2 - xm2) * this._lineSmoothness + item.Next.SecondaryValue - xm2;
                let c2Y = ym2 + (yc2 - ym2) * this._lineSmoothness + item.Next.PrimaryValue + nys - ym2;

                yield new LiveChartsCore.BezierData(item.Next).Init(
                    {
                        X0: c1X,
                        Y0: c1Y,
                        X1: c2X,
                        Y1: c2Y,
                        X2: item.Next.SecondaryValue,
                        Y2: item.Next.PrimaryValue + nys
                    });
            }
        }
            .bind(this);
        return System.EnumerableFrom(() => _$generator(points, stacker));
    }

    SetDefaultPointTransitions(chartPoint: LiveChartsCore.ChartPoint) {
        let chart = chartPoint.Context.Chart;

        let visual = (chartPoint.Context.Visual as TVisualPoint)!;
        LiveChartsCore.Extensions.TransitionateProperties(
            visual.Geometry
            , "visual.Geometry.X",
            "visual.Geometry.Y",
            "visual.Geometry.Width",
            "visual.Geometry.Height",
            "visual.Geometry.TranslateTransform")
            .WithAnimationBuilder(animation =>
                animation
                    .WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed)
                    .WithEasingFunction(this.EasingFunction ?? chart.EasingFunction))
            .CompleteCurrentTransitions();
        LiveChartsCore.Extensions.TransitionateProperties(
            visual.Bezier
            , "visual.Bezier.Xi",
            "visual.Bezier.Yi",
            "visual.Bezier.Xm",
            "visual.Bezier.Ym",
            "visual.Bezier.Xj",
            "visual.Bezier.Yj")
            .WithAnimationBuilder(animation =>
                animation
                    .WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed)
                    .WithEasingFunction(this.EasingFunction ?? chart.EasingFunction))
            .CompleteCurrentTransitions();
    }

    SoftDeleteOrDisposePoint(point: LiveChartsCore.ChartPoint, primaryScale: LiveChartsCore.Scaler, secondaryScale: LiveChartsCore.Scaler) {
        let visual = <Nullable<TVisualPoint>><unknown>point.Context.Visual;
        if (visual == null) return;
        if (this.DataFactory == null) throw new System.Exception("Data provider not found");

        let x = secondaryScale.ToPixels(point.SecondaryValue);
        let y = primaryScale.ToPixels(point.PrimaryValue);

        visual.Geometry.X = x;
        visual.Geometry.Y = y;
        visual.Geometry.Height = 0;
        visual.Geometry.Width = 0;
        visual.Geometry.RemoveOnCompleted = true;

        this.DataFactory.DisposePoint(point);

        let label = <Nullable<TLabel>><unknown>point.Context.Label;
        if (label == null) return;

        label.TextSize = 1;
        label.RemoveOnCompleted = true;
    }

    private DeleteNullPoint(point: LiveChartsCore.ChartPoint, xScale: LiveChartsCore.Scaler, yScale: LiveChartsCore.Scaler) {
        let visual: TVisualPoint;
        if (point.Context.Visual instanceof LiveChartsCore.BezierVisualPoint<TDrawingContext, TVisual>)
            visual = (point.Context.Visual as TVisualPoint)!;
        else
            return;

        let x = xScale.ToPixels(point.SecondaryValue);
        let y = yScale.ToPixels(point.PrimaryValue);
        let gs = this._geometrySize;
        let hgs = gs / 2;

        visual.Geometry.X = x - hgs;
        visual.Geometry.Y = y - hgs;
        visual.Geometry.Width = gs;
        visual.Geometry.Height = gs;
        visual.Geometry.RemoveOnCompleted = true;
        point.Context.Visual = null;
    }

    private static SplineData = class {
        public constructor(start: LiveChartsCore.ChartPoint) {
            this.Previous = start;
            this.Current = start;
            this.Next = start;
            this.AfterNext = start;
        }

        public Previous: LiveChartsCore.ChartPoint;

        public Current: LiveChartsCore.ChartPoint;

        public Next: LiveChartsCore.ChartPoint;

        public AfterNext: LiveChartsCore.ChartPoint;

        public IsFirst: boolean = true;

        public GoNext(point: LiveChartsCore.ChartPoint) {
            this.Previous = this.Current;
            this.Current = this.Next;
            this.Next = this.AfterNext;
            this.AfterNext = point;
        }
    }
}
