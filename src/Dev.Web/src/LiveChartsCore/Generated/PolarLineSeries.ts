import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class PolarLineSeries<TModel, TVisual extends object & LiveChartsCore.ISizedVisualChartPoint<TDrawingContext>, TLabel extends object & LiveChartsCore.ILabelGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext, TPathGeometry extends LiveChartsCore.IVectorGeometry<LiveChartsCore.CubicBezierSegment, TDrawingContext>, TVisualPoint extends LiveChartsCore.BezierVisualPoint<TDrawingContext, TVisual>> extends LiveChartsCore.ChartSeries<TModel, TVisualPoint, TLabel, TDrawingContext> implements LiveChartsCore.IPolarLineSeries<TDrawingContext>, LiveChartsCore.IPolarSeries<TDrawingContext> {
    private readonly _fillPathHelperDictionary: System.Dictionary<any, System.List<TPathGeometry>> = new System.Dictionary();
    private readonly _strokePathHelperDictionary: System.Dictionary<any, System.List<TPathGeometry>> = new System.Dictionary();
    private _lineSmoothness: number = 0.65;
    private _geometrySize: number = 14;
    private _enableNullSplitting: boolean = true;
    private _geometryFill: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _geometryStroke: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _stroke: Nullable<LiveChartsCore.IPaint<TDrawingContext>> = null;
    private _fill: Nullable<LiveChartsCore.IPaint<TDrawingContext>> = null;
    private _scalesAngleAt: number = 0;
    private _scalesRadiusAt: number = 0;
    private _isClosed: boolean = true;
    private _labelsPosition: LiveChartsCore.PolarLabelsPosition = 0;

    protected readonly _visualPointFactory: System.Func1<TVisualPoint>;
    protected readonly _pathGeometryFactory: System.Func1<TPathGeometry>;
    protected readonly _visualFactory: System.Func1<TVisual>;
    protected readonly _labelFactory: System.Func1<TLabel>;

    public constructor(visualFactory: System.Func1<TVisual>, labelFactory: System.Func1<TLabel>,
                       pathGeometryFactory: System.Func1<TPathGeometry>, visualPointFactory: System.Func1<TVisualPoint>, isStacked: boolean = false) {
        super(LiveChartsCore.SeriesProperties.Polar | LiveChartsCore.SeriesProperties.PolarLine |
            (isStacked ? LiveChartsCore.SeriesProperties.Stacked : 0) | LiveChartsCore.SeriesProperties.Sketch | LiveChartsCore.SeriesProperties.PrefersXStrategyTooltips);
        this._visualPointFactory = visualPointFactory;
        this._pathGeometryFactory = pathGeometryFactory;
        this._visualFactory = visualFactory;
        this._labelFactory = labelFactory;
        this.DataPadding = new LiveChartsCore.LvcPoint(1, 1.5);
    }

    public get Stroke(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._stroke;
    }

    public set Stroke(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._stroke, $v => this._stroke = $v), value, true);
    }

    public get Fill(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._fill;
    }

    public set Fill(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._fill, $v => this._fill = $v), value);
    }

    public get GeometrySize(): number {
        return this._geometrySize;
    }

    public set GeometrySize(value: number) {
        this.SetProperty(new System.Ref(() => this._geometrySize, $v => this._geometrySize = $v), <number><unknown>value);
    }

    public get ScalesAngleAt(): number {
        return this._scalesAngleAt;
    }

    public set ScalesAngleAt(value: number) {
        this.SetProperty(new System.Ref(() => this._scalesAngleAt, $v => this._scalesAngleAt = $v), value);
    }

    public get ScalesRadiusAt(): number {
        return this._scalesRadiusAt;
    }

    public set ScalesRadiusAt(value: number) {
        this.SetProperty(new System.Ref(() => this._scalesRadiusAt, $v => this._scalesRadiusAt = $v), value);
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

    public get IsClosed(): boolean {
        return this._isClosed;
    }

    public set IsClosed(value: boolean) {
        this.SetProperty(new System.Ref(() => this._isClosed, $v => this._isClosed = $v), value);
    }

    public get DataLabelsPosition(): LiveChartsCore.PolarLabelsPosition {
        return this._labelsPosition;
    }

    public set DataLabelsPosition(value: LiveChartsCore.PolarLabelsPosition) {
        this.SetProperty(new System.Ref(() => this._labelsPosition, $v => this._labelsPosition = $v), value);
    }

    public Invalidate(chart: LiveChartsCore.Chart<TDrawingContext>) {
        let strokePathHelperContainer: any;
        let fillPathHelperContainer: any;
        let polarChart = <LiveChartsCore.PolarChart<TDrawingContext>><unknown>chart;
        let angleAxis = polarChart.AngleAxes[this.ScalesAngleAt];
        let radiusAxis = polarChart.RadiusAxes[this.ScalesRadiusAt];

        let drawLocation = (polarChart.DrawMarginLocation).Clone();
        let drawMarginSize = (polarChart.DrawMarginSize).Clone();

        let scaler = new LiveChartsCore.PolarScaler((drawLocation).Clone(), (drawMarginSize).Clone(), angleAxis, radiusAxis,
            polarChart.InnerRadius, polarChart.InitialRotation, polarChart.TotalAnge);

        let gs = this._geometrySize;
        let hgs = gs / 2;
        let sw = this.Stroke?.StrokeThickness ?? 0;

        let points = this.Fetch(polarChart).ToArray();

        let segments = this._enableNullSplitting
            ? this.SplitEachNull(points, scaler)
            : [points];

        let stacker = (this.SeriesProperties & LiveChartsCore.SeriesProperties.Stacked) == LiveChartsCore.SeriesProperties.Stacked
            ? polarChart.SeriesContext.GetStackPosition(this, this.GetStackGroup())
            : null;

        let actualZIndex = this.ZIndex == 0 ? (<LiveChartsCore.ISeries><unknown>this).SeriesId : this.ZIndex;

        if (stacker != null) {
            // easy workaround to set an automatic and valid z-index for stacked area series
            // the problem of this solution is that the user needs to set z-indexes above 1000
            // if the user needs to add more series to the chart.
            actualZIndex = 1000 - stacker.Position;
            if (this.Fill != null) this.Fill.ZIndex = actualZIndex;
            if (this.Stroke != null) this.Stroke.ZIndex = actualZIndex;
        }

        let dls = <number><unknown>this.DataLabelsSize;

        let segmentI = 0;
        let pointsCleanup = LiveChartsCore.ChartPointCleanupContext.For(this.everFetched);

        if (!this._strokePathHelperDictionary.TryGetValue(chart.Canvas.Sync, new System.Out(() => strokePathHelperContainer, $v => strokePathHelperContainer = $v))) {
            strokePathHelperContainer = new System.List<TPathGeometry>();
            this._strokePathHelperDictionary.SetAt(chart.Canvas.Sync, strokePathHelperContainer);
        }

        if (!this._fillPathHelperDictionary.TryGetValue(chart.Canvas.Sync, new System.Out(() => fillPathHelperContainer, $v => fillPathHelperContainer = $v))) {
            fillPathHelperContainer = new System.List<TPathGeometry>();
            this._fillPathHelperDictionary.SetAt(chart.Canvas.Sync, fillPathHelperContainer);
        }

        for (const item of strokePathHelperContainer) item.ClearCommands();
        for (const item of fillPathHelperContainer) item.ClearCommands();

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

        for (const segment of segments) {
            let fillPath: TPathGeometry;
            let strokePath: TPathGeometry;

            if (segmentI >= fillPathHelperContainer.length) {
                fillPath = this._pathGeometryFactory(); //new TPathGeometry { ClosingMethod = VectorClosingMethod.NotClosed };
                fillPath.ClosingMethod = LiveChartsCore.VectorClosingMethod.NotClosed;
                strokePath = this._pathGeometryFactory(); //new TPathGeometry { ClosingMethod = VectorClosingMethod.NotClosed };
                strokePath.ClosingMethod = LiveChartsCore.VectorClosingMethod.NotClosed;
                fillPathHelperContainer.Add(fillPath);
                strokePathHelperContainer.Add(strokePath);
            } else {
                fillPath = fillPathHelperContainer[segmentI];
                strokePath = strokePathHelperContainer[segmentI];
            }

            if (this.Fill != null) {
                this.Fill.AddGeometryToPaintTask(polarChart.Canvas, fillPath);
                polarChart.Canvas.AddDrawableTask(this.Fill);
                this.Fill.ZIndex = actualZIndex + 0.1;
                this.Fill.SetClipRectangle(polarChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
            }
            if (this.Stroke != null) {
                this.Stroke.AddGeometryToPaintTask(polarChart.Canvas, strokePath);
                polarChart.Canvas.AddDrawableTask(this.Stroke);
                this.Stroke.ZIndex = actualZIndex + 0.2;
                this.Stroke.SetClipRectangle(polarChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
            }

            for (const data of this.GetSpline(segment, scaler, stacker)) {
                let s = 0;
                if (stacker != null) {
                    s = stacker.GetStack(data.TargetPoint).Start;
                }

                let cp = scaler.ToPixels(data.TargetPoint.SecondaryValue, data.TargetPoint.PrimaryValue + s);

                let x = cp.X;
                let y = cp.Y;

                let visual = <Nullable<TVisualPoint>><unknown>data.TargetPoint.Context.Visual;

                if (visual == null) {
                    let v = this._visualPointFactory(); //new TVisualPoint();

                    visual = v;

                    let x0b = scaler.CenterX - hgs;
                    let x1b = scaler.CenterX - hgs;
                    let x2b = scaler.CenterX - hgs;
                    let y0b = scaler.CenterY - hgs;
                    let y1b = scaler.CenterY - hgs;
                    let y2b = scaler.CenterY - hgs;

                    v.Geometry.X = scaler.CenterX;
                    v.Geometry.Y = scaler.CenterY;
                    v.Geometry.Width = gs;
                    v.Geometry.Height = gs;

                    v.Bezier.Xi = <number><unknown>x0b;
                    v.Bezier.Yi = y0b;
                    v.Bezier.Xm = <number><unknown>x1b;
                    v.Bezier.Ym = y1b;
                    v.Bezier.Xj = <number><unknown>x2b;
                    v.Bezier.Yj = y2b;

                    data.TargetPoint.Context.Visual = v;
                    this.OnPointCreated(data.TargetPoint);
                }
                this.everFetched.Add(data.TargetPoint);

                this.GeometryFill?.AddGeometryToPaintTask(polarChart.Canvas, visual.Geometry);
                this.GeometryStroke?.AddGeometryToPaintTask(polarChart.Canvas, visual.Geometry);

                visual.Bezier.Xi = <number><unknown>data.X0;
                visual.Bezier.Yi = <number><unknown>data.Y0;
                visual.Bezier.Xm = <number><unknown>data.X1;
                visual.Bezier.Ym = <number><unknown>data.Y1;
                visual.Bezier.Xj = <number><unknown>data.X2;
                visual.Bezier.Yj = <number><unknown>data.Y2;

                if (this.Fill != null) fillPath.AddLast(visual.Bezier);
                if (this.Stroke != null) strokePath.AddLast(visual.Bezier);

                visual.Geometry.X = x - hgs;
                visual.Geometry.Y = y - hgs;
                visual.Geometry.Width = gs;
                visual.Geometry.Height = gs;
                visual.Geometry.RemoveOnCompleted = false;

                visual.FillPath = fillPath;
                visual.StrokePath = strokePath;

                let hags = gs < 16 ? 16 : gs;
                let ha: LiveChartsCore.RectangleHoverArea;
                if (data.TargetPoint.Context.HoverArea instanceof LiveChartsCore.RectangleHoverArea)
                    ha = (data.TargetPoint.Context.HoverArea as LiveChartsCore.RectangleHoverArea)!;
                else
                    data.TargetPoint.Context.HoverArea = ha = new LiveChartsCore.RectangleHoverArea();
                ha.SetDimensions(x - hags * 0.5, y - hags * 0.5, hags, hags);

                pointsCleanup.Clean(data.TargetPoint);

                if (this.DataLabelsPaint != null) {
                    let label = <Nullable<TLabel>><unknown>data.TargetPoint.Context.Label;

                    let actualRotation = r +
                        (isTangent ? scaler.GetAngle(data.TargetPoint.SecondaryValue) - 90 : 0) +
                        (isCotangent ? scaler.GetAngle(data.TargetPoint.SecondaryValue) : 0);

                    if ((isTangent || isCotangent) && ((actualRotation + 90) % 360) > 180)
                        actualRotation += 180;

                    if (label == null) {
                        //var l = new TLabel { X = x - hgs, Y = scaler.CenterY - hgs, RotateTransform = (float)actualRotation };
                        let l = this._labelFactory();
                        l.X = x - hgs;
                        l.Y = scaler.CenterY - hgs;
                        l.RotateTransform = actualRotation;
                        LiveChartsCore.Extensions.TransitionateProperties(l, "l.X", "l.Y")
                            .WithAnimationBuilder(animation =>
                                animation
                                    .WithDuration(this.AnimationsSpeed ?? polarChart.AnimationsSpeed)
                                    .WithEasingFunction(this.EasingFunction ?? polarChart.EasingFunction));

                        l.CompleteTransition(null);
                        label = l;
                        data.TargetPoint.Context.Label = l;
                    }

                    this.DataLabelsPaint.AddGeometryToPaintTask(polarChart.Canvas, label);
                    label.Text = this.DataLabelsFormatter(new LiveChartsCore.ChartPoint3<TModel, TVisualPoint, TLabel>(data.TargetPoint));
                    label.TextSize = dls;
                    label.Padding = this.DataLabelsPadding;
                    label.RotateTransform = actualRotation;

                    let rad = Math.sqrt(Math.pow(cp.X - scaler.CenterX, 2) + Math.pow(cp.Y - scaler.CenterY, 2));

                    let labelPosition = this.GetLabelPolarPosition(
                        scaler.CenterX, scaler.CenterY, <number><unknown>rad, scaler.GetAngle(data.TargetPoint.SecondaryValue),
                        label.Measure(this.DataLabelsPaint), <number><unknown>this.GeometrySize, this.DataLabelsPosition);

                    label.X = labelPosition.X;
                    label.Y = labelPosition.Y;
                }

                this.OnPointMeasured(data.TargetPoint);
            }

            if (this.GeometryFill != null) {
                polarChart.Canvas.AddDrawableTask(this.GeometryFill);
                this.GeometryFill.SetClipRectangle(polarChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
                this.GeometryFill.ZIndex = actualZIndex + 0.3;
            }
            if (this.GeometryStroke != null) {
                polarChart.Canvas.AddDrawableTask(this.GeometryStroke);
                this.GeometryStroke.SetClipRectangle(polarChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
                this.GeometryStroke.ZIndex = actualZIndex + 0.4;
            }
            segmentI++;
        }

        while (segmentI > fillPathHelperContainer.length) {
            let iFill = fillPathHelperContainer.length - 1;
            let fillHelper = fillPathHelperContainer[iFill];
            this.Fill?.RemoveGeometryFromPainTask(polarChart.Canvas, fillHelper);
            fillPathHelperContainer.RemoveAt(iFill);

            let iStroke = strokePathHelperContainer.length - 1;
            let strokeHelper = strokePathHelperContainer[iStroke];
            this.Stroke?.RemoveGeometryFromPainTask(polarChart.Canvas, strokeHelper);
            strokePathHelperContainer.RemoveAt(iStroke);
        }

        if (this.DataLabelsPaint != null) {
            polarChart.Canvas.AddDrawableTask(this.DataLabelsPaint);
            //DataLabelsPaint.SetClipRectangle(polarChart.Canvas, new LvcRectangle(drawLocation, drawMarginSize));
            this.DataLabelsPaint.ZIndex = actualZIndex + 0.5;
        }

        pointsCleanup.CollectPointsForPolar(this.everFetched, polarChart.View, scaler, this.SoftDeleteOrDisposePoint.bind(this));
    }

    public GetBounds(chart: LiveChartsCore.PolarChart<TDrawingContext>, angleAxis: LiveChartsCore.IPolarAxis, radiusAxis: LiveChartsCore.IPolarAxis): LiveChartsCore.SeriesBounds {
        if (this.DataFactory == null)
            throw new System.Exception("A data provider is required");
        let baseSeriesBounds = this.DataFactory.GetCartesianBounds(chart, this, angleAxis, radiusAxis);

        if (baseSeriesBounds.HasData) return baseSeriesBounds;
        let baseBounds = baseSeriesBounds.Bounds;

        let tickPrimary = LiveChartsCore.Extensions.GetTickForPolar(radiusAxis, chart, baseBounds.VisiblePrimaryBounds);

        let tp = tickPrimary.Value * this.DataPadding.Y;

        if (baseBounds.VisiblePrimaryBounds.Delta == 0) {
            let mp = baseBounds.VisiblePrimaryBounds.Min == 0 ? 1 : baseBounds.VisiblePrimaryBounds.Min;
            tp = 0.1 * mp * this.DataPadding.Y;
        }

        let rgs = this.GeometrySize * 0.5 + (this.Stroke?.StrokeThickness ?? 0);

        return new LiveChartsCore.SeriesBounds(new LiveChartsCore.DimensionalBounds().Init(
                {
                    SecondaryBounds: new LiveChartsCore.Bounds().Init(
                        {
                            Max: baseBounds.SecondaryBounds.Max,
                            Min: baseBounds.SecondaryBounds.Min,
                            MinDelta: baseBounds.SecondaryBounds.MinDelta,
                            PaddingMax: 1,
                            PaddingMin: 0,
                            RequestedGeometrySize: rgs
                        }),
                    PrimaryBounds: new LiveChartsCore.Bounds().Init(
                        {
                            Max: baseBounds.PrimaryBounds.Max,
                            Min: baseBounds.PrimaryBounds.Min,
                            MinDelta: baseBounds.PrimaryBounds.MinDelta,
                            PaddingMax: tp,
                            PaddingMin: tp,
                            RequestedGeometrySize: rgs
                        }),
                    VisibleSecondaryBounds: new LiveChartsCore.Bounds().Init(
                        {
                            Max: baseBounds.VisibleSecondaryBounds.Max,
                            Min: baseBounds.VisibleSecondaryBounds.Min,
                        }),
                    VisiblePrimaryBounds: new LiveChartsCore.Bounds().Init(
                        {
                            Max: baseBounds.VisiblePrimaryBounds.Max,
                            Min: baseBounds.VisiblePrimaryBounds.Min
                        })
                }),
            false);
    }

    public GetMiniatresSketch(): LiveChartsCore.Sketch<TDrawingContext> {
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

    public MiniatureEquals(series: LiveChartsCore.IChartSeries<TDrawingContext>): boolean {
        if (series instanceof LiveChartsCore.StrokeAndFillCartesianSeries<TModel, TVisual, TLabel, TDrawingContext>) {
            const sfSeries = series;
            return this.Name == series.Name && this.Fill == sfSeries.Fill && this.Stroke == sfSeries.Stroke;
        }
        return false;
    }

    public GetSpline(points: LiveChartsCore.ChartPoint[],
                     scaler: LiveChartsCore.PolarScaler,
                     stacker: Nullable<LiveChartsCore.StackPosition<TDrawingContext>>): System.IEnumerable<LiveChartsCore.BezierData> {
        const _$generator = function* (this: any, points: LiveChartsCore.ChartPoint[],
                                       scaler: LiveChartsCore.PolarScaler,
                                       stacker: Nullable<LiveChartsCore.StackPosition<TDrawingContext>>) {
            if (points.length == 0) return;

            let previous: LiveChartsCore.LvcPoint = LiveChartsCore.LvcPoint.Empty.Clone();
            let current: LiveChartsCore.LvcPoint = LiveChartsCore.LvcPoint.Empty.Clone();
            let next: LiveChartsCore.LvcPoint = LiveChartsCore.LvcPoint.Empty.Clone();
            let next2: LiveChartsCore.LvcPoint = LiveChartsCore.LvcPoint.Empty.Clone();

            for (let i = 0; i < points.length; i++) {
                let isClosed = this.IsClosed && points.length > 3;

                let a1 = i + 1 - points.length;
                let a2 = i + 2 - points.length;

                let p0 = points[i - 1 < 0 ? (isClosed ? points.length - 1 : 0) : i - 1];
                let p1 = points[i];
                let p2 = points[i + 1 > points.length - 1 ? (isClosed ? a1 : points.length - 1) : i + 1];
                let p3 = points[i + 2 > points.length - 1 ? (isClosed ? a2 : points.length - 1) : i + 2];

                previous = scaler.ToPixels(p0.SecondaryValue, p0.PrimaryValue);
                current = scaler.ToPixels(p1.SecondaryValue, p1.PrimaryValue);
                next = scaler.ToPixels(p2.SecondaryValue, p2.PrimaryValue);
                next2 = scaler.ToPixels(p3.SecondaryValue, p3.PrimaryValue);

                let pys = 0;
                let cys = 0;
                let nys = 0;
                let nnys = 0;

                if (stacker != null) {
                    pys = scaler.ToPixels(0, stacker.GetStack(p0).Start).Y;
                    cys = scaler.ToPixels(0, stacker.GetStack(p1).Start).Y;
                    nys = scaler.ToPixels(0, stacker.GetStack(p2).Start).Y;
                    nnys = scaler.ToPixels(0, stacker.GetStack(p3).Start).Y;
                }

                let xc1 = (previous.X + current.X) / 2.0;
                let yc1 = (previous.Y + pys + current.Y + cys) / 2.0;
                let xc2 = (current.X + next.X) / 2.0;
                let yc2 = (current.Y + cys + next.Y + nys) / 2.0;
                let xc3 = (next.X + next2.X) / 2.0;
                let yc3 = (next.Y + nys + next2.Y + nnys) / 2.0;

                let len1 = <number><unknown>Math.sqrt((current.X - previous.X) *
                    (current.X - previous.X) +
                    (current.Y + cys - previous.Y + pys) * (current.Y + cys - previous.Y + pys));
                let len2 = <number><unknown>Math.sqrt((next.X - current.X) *
                    (next.X - current.X) +
                    (next.Y + nys - current.Y + cys) * (next.Y + nys - current.Y + cys));
                let len3 = <number><unknown>Math.sqrt((next2.X - next.X) *
                    (next2.X - next.X) +
                    (next2.Y + nnys - next.Y + nys) * (next2.Y + nnys - next.Y + nys));

                let k1 = len1 / (len1 + len2);
                let k2 = len2 / (len2 + len3);

                if (Number.isNaN(k1)) k1 = 0;
                if (Number.isNaN(k2)) k2 = 0;

                let xm1 = xc1 + (xc2 - xc1) * k1;
                let ym1 = yc1 + (yc2 - yc1) * k1;
                let xm2 = xc2 + (xc3 - xc2) * k2;
                let ym2 = yc2 + (yc3 - yc2) * k2;

                let c1X = xm1 + (xc2 - xm1) * this._lineSmoothness + current.X - xm1;
                let c1Y = ym1 + (yc2 - ym1) * this._lineSmoothness + current.Y + cys - ym1;
                let c2X = xm2 + (xc2 - xm2) * this._lineSmoothness + next.X - xm2;
                let c2Y = ym2 + (yc2 - ym2) * this._lineSmoothness + next.Y + nys - ym2;

                let x0: number = 0;
                let y0: number = 0;

                if (i == 0) {
                    x0 = current.X;
                    y0 = current.Y + cys;
                } else {
                    x0 = c1X;
                    y0 = c1Y;
                }

                yield new LiveChartsCore.BezierData(points[i]).Init(
                    {
                        X0: x0,
                        Y0: y0,
                        X1: c2X,
                        Y1: c2Y,
                        X2: next.X,
                        Y2: next.Y
                    });
            }
        }
            .bind(this);
        return System.EnumerableFrom(() => _$generator(points, scaler, stacker));
    }

    protected SetDefaultPointTransitions(chartPoint: LiveChartsCore.ChartPoint) {
        let chart = chartPoint.Context.Chart;

        let visual = (chartPoint.Context.Visual as TVisualPoint)!;
        LiveChartsCore.Extensions.TransitionateProperties(
            visual.Geometry
            , "visual.Geometry.X",
            "visual.Geometry.Y",
            "visual.Geometry.Width",
            "visual.Geometry.Height")
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

    protected SoftDeleteOrDisposePoint(point: LiveChartsCore.ChartPoint, scaler: LiveChartsCore.PolarScaler) {
        let visual = <Nullable<TVisualPoint>><unknown>point.Context.Visual;
        if (visual == null) return;
        if (this.DataFactory == null) throw new System.Exception("Data provider not found");

        let p = scaler.ToPixelsFromCharPoint(point);
        let x = p.X;
        let y = p.Y;

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

    public SoftDeleteOrDispose(chart: LiveChartsCore.IChartView) {
        let core = (<LiveChartsCore.IPolarChartView<TDrawingContext>><unknown>chart).Core;

        let scale = new LiveChartsCore.PolarScaler((core.DrawMarginLocation).Clone(), (core.DrawMarginSize).Clone(), core.AngleAxes[this.ScalesAngleAt], core.RadiusAxes[this.ScalesRadiusAt],
            core.InnerRadius, core.InitialRotation, core.TotalAnge);

        let deleted = new System.List<LiveChartsCore.ChartPoint>();
        for (const point of this.everFetched) {
            if (point.Context.Chart != chart) continue;

            this.SoftDeleteOrDisposePoint(point, scale);
            deleted.Add(point);
        }

        for (const pt of this.GetPaintTasks()) {
            if (pt != null) core.Canvas.RemovePaintTask(pt);
        }

        for (const item of deleted) this.everFetched.Remove(item);

        let canvas = (<LiveChartsCore.IPolarChartView<TDrawingContext>><unknown>chart).CoreCanvas;

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

        this.OnVisibilityChanged();
    }

    public GetPaintTasks(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>[] {
        return [this.Stroke, this.Fill, this._geometryFill, this._geometryStroke, this.DataLabelsPaint, this.hoverPaint];
    }

    protected GetLabelPolarPosition(centerX: number,
                                    centerY: number,
                                    radius: number,
                                    angle: number,
                                    labelSize: LiveChartsCore.LvcSize,
                                    geometrySize: number,
                                    position: LiveChartsCore.PolarLabelsPosition): LiveChartsCore.LvcPoint {
        let toRadians: number = <number><unknown>(Math.PI / 180);
        let actualAngle: number = 0;

        switch (position) {
            case LiveChartsCore.PolarLabelsPosition.End:
                actualAngle = angle;
                radius += <number><unknown>Math.sqrt(Math.pow(labelSize.Width + geometrySize * 0.5, 2) +
                    Math.pow(labelSize.Height + geometrySize * 0.5, 2)) * 0.5;
                break;
            case LiveChartsCore.PolarLabelsPosition.Start:
                actualAngle = angle;
                radius -= <number><unknown>Math.sqrt(Math.pow(labelSize.Width + geometrySize * 0.5, 2) +
                    Math.pow(labelSize.Height + geometrySize * 0.5, 2)) * 0.5;
                break;
            case LiveChartsCore.PolarLabelsPosition.Outer:
                actualAngle = angle;
                radius *= 2;
                break;
            case LiveChartsCore.PolarLabelsPosition.Middle:
                actualAngle = angle;
                break;
            case LiveChartsCore.PolarLabelsPosition.ChartCenter:
                return new LiveChartsCore.LvcPoint(centerX, centerY);
            default:
                break;
        }

        actualAngle %= 360;
        if (actualAngle < 0) actualAngle += 360;
        actualAngle *= toRadians;

        return new LiveChartsCore.LvcPoint(<number><unknown>(centerX + Math.cos(actualAngle) * radius),
            <number><unknown>(centerY + Math.sin(actualAngle) * radius));
    }

    private SplitEachNull(points: LiveChartsCore.ChartPoint[],
                          scaler: LiveChartsCore.PolarScaler): System.IEnumerable<LiveChartsCore.ChartPoint[]> {
        const _$generator = function* (this: any, points: LiveChartsCore.ChartPoint[],
                                       scaler: LiveChartsCore.PolarScaler) {
            let l = new System.List<LiveChartsCore.ChartPoint>(points.length);

            for (const point of points) {
                if (point.IsEmpty) {
                    if (point.Context.Visual instanceof LiveChartsCore.BezierVisualPoint<TDrawingContext, TVisual>) {
                        const visual = point.Context.Visual;
                        let s = scaler.ToPixelsFromCharPoint(point);
                        let x = s.X;
                        let y = s.Y;
                        let gs = this._geometrySize;
                        let hgs = gs / 2;
                        let sw = this.Stroke?.StrokeThickness ?? 0;
                        visual.Geometry.X = x - hgs;
                        visual.Geometry.Y = y - hgs;
                        visual.Geometry.Width = gs;
                        visual.Geometry.Height = gs;
                        visual.Geometry.RemoveOnCompleted = true;
                        point.Context.Visual = null;
                    }


                    if (l.length > 0) yield l.ToArray();
                    l = new System.List<LiveChartsCore.ChartPoint>(points.length);
                    continue;
                }

                l.Add(point);
            }

            if (l.length > 0) yield l.ToArray();
        }
            .bind(this);
        return System.EnumerableFrom(() => _$generator(points, scaler));
    }
}
