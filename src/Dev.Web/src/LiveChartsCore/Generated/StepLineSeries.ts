import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class StepLineSeries<TModel, TVisual extends object & LiveChartsCore.ISizedVisualChartPoint<TDrawingContext>, TLabel extends object & LiveChartsCore.ILabelGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext, TPathGeometry extends LiveChartsCore.IVectorGeometry<LiveChartsCore.StepLineSegment, TDrawingContext>, TVisualPoint extends LiveChartsCore.StepLineVisualPoint<TDrawingContext, TVisual>> extends LiveChartsCore.StrokeAndFillCartesianSeries<TModel, TVisualPoint, TLabel, TDrawingContext> implements LiveChartsCore.IStepLineSeries<TDrawingContext> {
    private readonly _fillPathHelperDictionary: System.Dictionary<any, System.List<TPathGeometry>> = new System.Dictionary();
    private readonly _strokePathHelperDictionary: System.Dictionary<any, System.List<TPathGeometry>> = new System.Dictionary();

    private _geometrySize: number = 14;
    private _geometryFill: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _geometryStroke: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _enableNullSplitting: boolean = true;

    private readonly _visualFactory: System.Func1<TVisual>;
    private readonly _labelFactory: System.Func1<TLabel>;
    private readonly _pathGeometryFactory: System.Func1<TPathGeometry>;
    private readonly _visualPointFactory: System.Func1<TVisualPoint>;

    public constructor(visualFactory: System.Func1<TVisual>, labelFactory: System.Func1<TLabel>, pathGeometryFactory: System.Func1<TPathGeometry>, visualPointFactory: System.Func1<TVisualPoint>, isStacked: boolean = false) {
        super(LiveChartsCore.SeriesProperties.StepLine | LiveChartsCore.SeriesProperties.PrimaryAxisVerticalOrientation |
            (isStacked ? LiveChartsCore.SeriesProperties.Stacked : 0) | LiveChartsCore.SeriesProperties.Sketch | LiveChartsCore.SeriesProperties.PrefersXStrategyTooltips);
        this._visualFactory = visualFactory;
        this._labelFactory = labelFactory;
        this._pathGeometryFactory = pathGeometryFactory;
        this._visualPointFactory = visualPointFactory;
        this.DataPadding = new LiveChartsCore.LvcPoint(0.5, 1);
    }

    public get EnableNullSplitting(): boolean {
        return this._enableNullSplitting;
    }

    public set EnableNullSplitting(value: boolean) {
        this.SetProperty(new System.Ref(() => this._enableNullSplitting, $v => this._enableNullSplitting = $v), value, "EnableNullSplitting");
    }

    public get GeometrySize(): number {
        return this._geometrySize;
    }

    public set GeometrySize(value: number) {
        this.SetProperty(new System.Ref(() => this._geometrySize, $v => this._geometrySize = $v), <number><unknown>value, "GeometrySize");
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
        this.SetPaintProperty(new System.Ref(() => this._geometryStroke, $v => this._geometryStroke = $v), value, true, "GeometryStroke");
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

        // see note #240222
        let segments = this._enableNullSplitting
            ? LiveChartsCore.Extensions.SplitByNullGaps(this.Fetch(cartesianChart), point => this.DeleteNullPoint(point, secondaryScale, primaryScale))
            : new System.List<System.IEnumerable<LiveChartsCore.ChartPoint>>().Init([this.Fetch(cartesianChart)]);

        let stacker = (this.SeriesProperties & LiveChartsCore.SeriesProperties.Stacked) == LiveChartsCore.SeriesProperties.Stacked
            ? cartesianChart.SeriesContext.GetStackPosition(this, this.GetStackGroup())
            : null;

        let actualZIndex = this.ZIndex == 0 ? (<LiveChartsCore.ISeries><unknown>this).SeriesId : this.ZIndex;

        if (stacker != null) {
            // see note #010621
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

        let uwx = secondaryScale.MeasureInPixels(secondaryAxis.UnitWidth);
        uwx = uwx < gs ? gs : uwx;

        for (const segment of segments) {
            let fillPath: TPathGeometry;
            let strokePath: TPathGeometry;
            let isNew = false;

            if (segmentI >= fillPathHelperContainer.length) {
                isNew = true;
                fillPath = this._pathGeometryFactory(); //new TPathGeometry { ClosingMethod = VectorClosingMethod.CloseToPivot };
                fillPath.ClosingMethod = LiveChartsCore.VectorClosingMethod.CloseToPivot;
                strokePath = this._pathGeometryFactory(); //new TPathGeometry { ClosingMethod = VectorClosingMethod.NotClosed };
                strokePath.ClosingMethod = LiveChartsCore.VectorClosingMethod.NotClosed;
                fillPathHelperContainer.Add(fillPath);
                strokePathHelperContainer.Add(strokePath);
            } else {
                fillPath = fillPathHelperContainer[segmentI];
                strokePath = strokePathHelperContainer[segmentI];
            }

            let strokeVector = new LiveChartsCore.VectorManager<LiveChartsCore.StepLineSegment, TDrawingContext>(strokePath);
            let fillVector = new LiveChartsCore.VectorManager<LiveChartsCore.StepLineSegment, TDrawingContext>(fillPath);

            if (this.Fill != null) {
                this.Fill.AddGeometryToPaintTask(cartesianChart.Canvas, fillPath);
                cartesianChart.Canvas.AddDrawableTask(this.Fill);
                this.Fill.ZIndex = actualZIndex + 0.1;
                this.Fill.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
                fillPath.Pivot = p;
                if (isNew) {
                    LiveChartsCore.Extensions.TransitionateProperties(fillPath, "Pivot")
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
                    LiveChartsCore.Extensions.TransitionateProperties(strokePath, "Pivot")
                        .WithAnimationBuilder(animation =>
                            animation
                                .WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed)
                                .WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction))
                        .CompleteCurrentTransitions();
                }
            }

            let previousPrimary: number = 0;
            let previousSecondary: number = 0;

            for (const point of segment) {
                let s = 0;
                if (stacker != null) s = stacker.GetStack(point).Start;

                let visual = <Nullable<TVisualPoint>><unknown>point.Context.Visual;
                let dp = point.PrimaryValue + s - previousPrimary;
                let ds = point.SecondaryValue - previousSecondary;

                if (visual == null) {
                    let v = this._visualPointFactory(); //new TVisualPoint();
                    visual = v;

                    if (this.IsFirstDraw) {
                        v.Geometry.X = secondaryScale.ToPixels(point.SecondaryValue);
                        v.Geometry.Y = p;
                        v.Geometry.Width = 0;
                        v.Geometry.Height = 0;

                        v.StepSegment.Xi = secondaryScale.ToPixels(point.SecondaryValue - ds);
                        v.StepSegment.Xj = secondaryScale.ToPixels(point.SecondaryValue);
                        v.StepSegment.Yi = p;
                        v.StepSegment.Yj = p;
                    }

                    point.Context.Visual = v;
                    this.OnPointCreated(point);
                }
                this.everFetched.Add(point);

                this.GeometryFill?.AddGeometryToPaintTask(cartesianChart.Canvas, visual.Geometry);
                this.GeometryStroke?.AddGeometryToPaintTask(cartesianChart.Canvas, visual.Geometry);

                visual.StepSegment.Id = point.Context.Entity.EntityIndex;

                if (this.Fill != null) fillVector.AddConsecutiveSegment(visual.StepSegment, !this.IsFirstDraw);
                if (this.Stroke != null) strokeVector.AddConsecutiveSegment(visual.StepSegment, !this.IsFirstDraw);

                visual.StepSegment.Xi = secondaryScale.ToPixels(point.SecondaryValue - ds);
                visual.StepSegment.Xj = secondaryScale.ToPixels(point.SecondaryValue);
                visual.StepSegment.Yi = primaryScale.ToPixels(point.PrimaryValue + s - dp);
                visual.StepSegment.Yj = primaryScale.ToPixels(point.PrimaryValue + s);

                let x = secondaryScale.ToPixels(point.SecondaryValue);
                let y = primaryScale.ToPixels(point.PrimaryValue + s);

                visual.Geometry.MotionProperties.GetAt("X").CopyFrom(visual.StepSegment.MotionProperties.GetAt("Xj"));
                visual.Geometry.MotionProperties.GetAt("Y").CopyFrom(visual.StepSegment.MotionProperties.GetAt("Yj"));
                visual.Geometry.TranslateTransform = new LiveChartsCore.LvcPoint(-hgs, -hgs);

                visual.Geometry.Width = gs;
                visual.Geometry.Height = gs;
                visual.Geometry.RemoveOnCompleted = false;

                visual.FillPath = fillPath;
                visual.StrokePath = strokePath;

                let hags = gs < 8 ? 8 : gs;
                let ha: LiveChartsCore.RectangleHoverArea;
                if (point.Context.HoverArea instanceof LiveChartsCore.RectangleHoverArea)
                    ha = <LiveChartsCore.RectangleHoverArea><unknown>point.Context.HoverArea;
                else
                    point.Context.HoverArea = ha = new LiveChartsCore.RectangleHoverArea();
                ha.SetDimensions(x - uwx * 0.5, y - hgs, uwx, gs);

                pointsCleanup.Clean(point);

                if (this.DataLabelsPaint != null) {
                    let label = <Nullable<TLabel>><unknown>point.Context.Label;

                    if (label == null) {
                        //var l = new TLabel { X = x - hgs, Y = p - hgs, RotateTransform = (float)DataLabelsRotation };
                        let l = this._labelFactory();
                        l.X = x - hgs;
                        l.Y = p - hgs;
                        l.RotateTransform = <number><unknown>this.DataLabelsRotation;
                        LiveChartsCore.Extensions.TransitionateProperties(l, "X", "Y")
                            .WithAnimationBuilder(animation =>
                                animation
                                    .WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed)
                                    .WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));

                        l.CompleteTransition(null);
                        label = l;
                        point.Context.Label = l;
                    }

                    this.DataLabelsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, label);
                    label.Text = this.DataLabelsFormatter(new LiveChartsCore.ChartPoint3<TModel, TVisualPoint, TLabel>(point));
                    label.TextSize = dls;
                    label.Padding = this.DataLabelsPadding;
                    let m = label.Measure(this.DataLabelsPaint);
                    let labelPosition = this.GetLabelPosition(
                        x - hgs, y - hgs, gs, gs, (m).Clone(), this.DataLabelsPosition,
                        this.SeriesProperties, point.PrimaryValue > this.Pivot, (drawLocation).Clone(), (drawMarginSize).Clone());
                    if (this.DataLabelsTranslate != null) label.TranslateTransform =
                        new LiveChartsCore.LvcPoint(m.Width * this.DataLabelsTranslate.X, m.Height * this.DataLabelsTranslate.Y);

                    label.X = labelPosition.X;
                    label.Y = labelPosition.Y;
                }

                this.OnPointMeasured(point);
                previousPrimary = point.PrimaryValue + s;
                previousSecondary = point.SecondaryValue;
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
            segmentI++;
        }

        while (segmentI > fillPathHelperContainer.length) {
            let iFill = fillPathHelperContainer.length - 1;
            let fillHelper = fillPathHelperContainer[iFill];
            this.Fill?.RemoveGeometryFromPainTask(cartesianChart.Canvas, fillHelper);
            fillPathHelperContainer.RemoveAt(iFill);

            let iStroke = strokePathHelperContainer.length - 1;
            let strokeHelper = strokePathHelperContainer[iStroke];
            this.Stroke?.RemoveGeometryFromPainTask(cartesianChart.Canvas, strokeHelper);
            strokePathHelperContainer.RemoveAt(iStroke);
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

    MiniatureEquals(series: LiveChartsCore.IChartSeries<TDrawingContext>): boolean {
        if (series instanceof StepLineSeries<TModel, TVisual, TLabel, TDrawingContext, TPathGeometry, TVisualPoint>) {
            const stepSeries = series;
            return this.Name == series.Name &&
                !(<LiveChartsCore.ISeries><unknown>this).PaintsChanged &&
                this.Fill == stepSeries.Fill && this.Stroke == stepSeries.Stroke &&
                this.GeometryFill == stepSeries.GeometryFill && this.GeometryStroke == stepSeries.GeometryStroke;
        }
        return false;
    }

    SetDefaultPointTransitions(chartPoint: LiveChartsCore.ChartPoint) {
        let chart = chartPoint.Context.Chart;

        let visual = (chartPoint.Context.Visual as TVisualPoint)!;
        LiveChartsCore.Extensions.TransitionateProperties(
            visual.Geometry
            , "X",
            "Y",
            "Width",
            "Height",
            "TranslateTransform")
            .WithAnimationBuilder(animation =>
                animation
                    .WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed)
                    .WithEasingFunction(this.EasingFunction ?? chart.EasingFunction))
            .CompleteCurrentTransitions();
        LiveChartsCore.Extensions.TransitionateProperties(
            visual.StepSegment
            , "Xi",
            "Yi",
            "Xj",
            "Yj")
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

        let chartView = <LiveChartsCore.ICartesianChartView<TDrawingContext>><unknown>point.Context.Chart;
        if (chartView.Core.IsZoomingOrPanning) {
            visual.Geometry.CompleteTransition(null);
            visual.Geometry.RemoveOnCompleted = true;
            this.DataFactory.DisposePoint(point);
            return;
        }

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

    SoftDeleteOrDispose(chart: LiveChartsCore.IChartView) {
        super.SoftDeleteOrDispose(chart);
        let canvas = (<LiveChartsCore.ICartesianChartView<TDrawingContext>><unknown>chart).CoreCanvas;

        if (this.Fill != null) {
            for (const activeChartContainer of this._fillPathHelperDictionary.Values)
                for (const pathHelper of activeChartContainer)
                    this.Fill.RemoveGeometryFromPainTask(canvas, pathHelper);
        }

        if (this.Stroke != null) {
            for (const activeChartContainer of this._strokePathHelperDictionary.Values)
                for (const pathHelper of activeChartContainer)
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

    private DeleteNullPoint(point: LiveChartsCore.ChartPoint, xScale: LiveChartsCore.Scaler, yScale: LiveChartsCore.Scaler) {
        let visual: TVisualPoint;
        if (point.Context.Visual instanceof LiveChartsCore.StepLineVisualPoint<TDrawingContext, TVisual>)
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
}
