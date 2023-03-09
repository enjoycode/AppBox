import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class PolarChart<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.Chart<TDrawingContext> {
    private readonly _chartView: LiveChartsCore.IPolarChartView<TDrawingContext>;
    private _nextSeries: number = 0;
    private readonly _requiresLegendMeasureAlways: boolean = false;

    public constructor(
        view: LiveChartsCore.IPolarChartView<TDrawingContext>,
        defaultPlatformConfig: System.Action1<LiveChartsCore.LiveChartsSettings>,
        canvas: LiveChartsCore.MotionCanvas<TDrawingContext>,
        requiresLegendMeasureAlways: boolean = false) {
        super(canvas, defaultPlatformConfig, view);
        this._chartView = view;
        this._requiresLegendMeasureAlways = requiresLegendMeasureAlways;
    }

    #AngleAxes: LiveChartsCore.IPolarAxis[] = [];
    public get AngleAxes() {
        return this.#AngleAxes;
    }

    private set AngleAxes(value) {
        this.#AngleAxes = value;
    }

    #RadiusAxes: LiveChartsCore.IPolarAxis[] = [];
    public get RadiusAxes() {
        return this.#RadiusAxes;
    }

    private set RadiusAxes(value) {
        this.#RadiusAxes = value;
    }

    #Series: LiveChartsCore.IPolarSeries<TDrawingContext>[] = [];
    public get Series() {
        return this.#Series;
    }

    private set Series(value) {
        this.#Series = value;
    }

    #FitToBounds: boolean = false;
    public get FitToBounds() {
        return this.#FitToBounds;
    }

    private set FitToBounds(value) {
        this.#FitToBounds = value;
    }

    #TotalAnge: number = 0;
    public get TotalAnge() {
        return this.#TotalAnge;
    }

    private set TotalAnge(value) {
        this.#TotalAnge = value;
    }

    #InnerRadius: number = 0;
    public get InnerRadius() {
        return this.#InnerRadius;
    }

    private set InnerRadius(value) {
        this.#InnerRadius = value;
    }

    #InitialRotation: number = 0;
    public get InitialRotation() {
        return this.#InitialRotation;
    }

    private set InitialRotation(value) {
        this.#InitialRotation = value;
    }

    public get ChartSeries(): System.IEnumerable<LiveChartsCore.IChartSeries<TDrawingContext>> {
        return this.Series;
    }

    public get View(): LiveChartsCore.IChartView1<TDrawingContext> {
        return this._chartView;
    }

    public FindHoveredPointsBy(pointerPosition: LiveChartsCore.LvcPoint): System.IEnumerable<LiveChartsCore.ChartPoint> {
        return this.ChartSeries
            .Where(series => series.IsHoverable)
            .SelectMany(series => series.FindHitPoints(this, (pointerPosition).Clone(), LiveChartsCore.TooltipFindingStrategy.CompareAll));
    }

    public Measure() {
        if (!this.IsLoaded) return; // <- prevents a visual glitch where the visual call the measure method
        // while they are not visible, the problem is when the control is visible again
        // the animations are not as expected because previously it ran in an invalid case.

        this.InvokeOnMeasuring();

        if (this._preserveFirstDraw) {
            this.IsFirstDraw = true;
            this._preserveFirstDraw = false;
        }

        this.MeasureWork = {};


        let viewDrawMargin = this._chartView.DrawMargin;
        this.ControlSize = (this._chartView.ControlSize).Clone();

        this.AngleAxes = this._chartView.AngleAxes.Cast<LiveChartsCore.IPolarAxis>().Select(x => x).ToArray();
        this.RadiusAxes = this._chartView.RadiusAxes.Cast<LiveChartsCore.IPolarAxis>().Select(x => x).ToArray();

        let theme = LiveChartsCore.LiveCharts.DefaultSettings.GetTheme<TDrawingContext>();

        this.LegendPosition = this._chartView.LegendPosition;
        this.Legend = this._chartView.Legend;

        this.TooltipPosition = this._chartView.TooltipPosition;
        this.Tooltip = this._chartView.Tooltip;

        this.AnimationsSpeed = this._chartView.AnimationsSpeed;
        this.EasingFunction = this._chartView.EasingFunction;

        this.FitToBounds = this._chartView.FitToBounds;
        this.TotalAnge = <number><unknown>this._chartView.TotalAngle;
        this.InnerRadius = <number><unknown>this._chartView.InnerRadius;
        this.InitialRotation = <number><unknown>this._chartView.InitialRotation;

        //var actualSeries = (_chartView.Series ?? Enumerable.Empty<ISeries>()).Where(x => x.IsVisible);
        let actualSeries: System.IEnumerable<LiveChartsCore.ISeries> = this._chartView.Series == null
            ? [] : this._chartView.Series.Where(x => x.IsVisible);

        this.Series = actualSeries
            .Cast<LiveChartsCore.IPolarSeries<TDrawingContext>>()
            .ToArray();

        this.VisualElements = this._chartView.VisualElements?.ToArray() ?? [];


        this.SeriesContext = new LiveChartsCore.SeriesContext<TDrawingContext>(this.Series);
        let isNewTheme = LiveChartsCore.LiveCharts.DefaultSettings.CurrentThemeId != this.ThemeId;

        // restart axes bounds and meta data
        for (const axis of this.AngleAxes) {
            let ce = <LiveChartsCore.ChartElement<TDrawingContext>><unknown>axis;
            ce._isInternalSet = true;
            axis.Initialize(LiveChartsCore.PolarAxisOrientation.Angle);
            if (!ce._isThemeSet || isNewTheme) {
                theme.ApplyStyleToAxis(<LiveChartsCore.IPlane1<TDrawingContext>><unknown>axis);
                ce._isThemeSet = true;
            }
            ce._isInternalSet = false;
        }
        for (const axis of this.RadiusAxes) {
            let ce = <LiveChartsCore.ChartElement<TDrawingContext>><unknown>axis;
            ce._isInternalSet = true;
            axis.Initialize(LiveChartsCore.PolarAxisOrientation.Radius);
            if (!ce._isThemeSet || isNewTheme) {
                theme.ApplyStyleToAxis(<LiveChartsCore.IPlane1<TDrawingContext>><unknown>axis);
                ce._isThemeSet = true;
            }
            ce._isInternalSet = false;
        }

        // get seriesBounds
        this.SetDrawMargin((this.ControlSize).Clone(), LiveChartsCore.Margin.Empty());
        for (const series of this.Series) {
            if (series.SeriesId == -1) series.SeriesId = this._nextSeries++;

            let ce = <LiveChartsCore.ChartElement<TDrawingContext>><unknown>series;
            ce._isInternalSet = true;
            if (!ce._isThemeSet || isNewTheme) {
                theme.ApplyStyleToSeries(series);
                ce._isThemeSet = true;
            }

            let secondaryAxis = this.AngleAxes[series.ScalesAngleAt];
            let primaryAxis = this.RadiusAxes[series.ScalesRadiusAt];

            let seriesBounds = series.GetBounds(this, secondaryAxis, primaryAxis).Bounds;

            if (seriesBounds.IsEmpty) continue;

            secondaryAxis.DataBounds.AppendValueByBounds(seriesBounds.SecondaryBounds);
            primaryAxis.DataBounds.AppendValueByBounds(seriesBounds.PrimaryBounds);
            secondaryAxis.VisibleDataBounds.AppendValueByBounds(seriesBounds.SecondaryBounds);
            primaryAxis.VisibleDataBounds.AppendValueByBounds(seriesBounds.PrimaryBounds);
        }


        // prevent the bounds are not empty...

        for (const axis of this.AngleAxes) {
            let ce = <LiveChartsCore.ChartElement<TDrawingContext>><unknown>axis;
            ce._isInternalSet = true;

            if (!axis.DataBounds.IsEmpty) {
                ce._isInternalSet = false;
                continue;
            }

            let min = 0;
            let max = 10 * axis.UnitWidth;

            axis.DataBounds.AppendValue(max);
            axis.DataBounds.AppendValue(min);
            axis.VisibleDataBounds.AppendValue(max);
            axis.VisibleDataBounds.AppendValue(min);

            if (axis.DataBounds.MinDelta < max) axis.DataBounds.MinDelta = max;

            ce._isInternalSet = false;
        }
        for (const axis of this.RadiusAxes) {
            let ce = <LiveChartsCore.ChartElement<TDrawingContext>><unknown>axis;
            ce._isInternalSet = true;

            if (!axis.DataBounds.IsEmpty) {
                ce._isInternalSet = false;
                continue;
            }

            let min = 0;
            let max = 10 * axis.UnitWidth;

            axis.DataBounds.AppendValue(max);
            axis.DataBounds.AppendValue(min);
            axis.VisibleDataBounds.AppendValue(max);
            axis.VisibleDataBounds.AppendValue(min);

            if (axis.DataBounds.MinDelta < max) axis.DataBounds.MinDelta = max;

            ce._isInternalSet = false;
        }


        this.InitializeVisualsCollector();

        let seriesInLegend = this.Series.Where(x => x.IsVisibleAtLegend).ToArray();
        this.DrawLegend(seriesInLegend);

        // calculate draw margin

        if (this.FitToBounds) {
            let mt: number = 0;
            let mb: number = 0;
            let ml: number = 0;
            let mr: number = 0;

            for (const series of this.Series) {
                let scaler = new LiveChartsCore.PolarScaler((this.DrawMarginLocation).Clone(), (this.DrawMarginSize).Clone(), this.AngleAxes[series.ScalesAngleAt], this.RadiusAxes[series.ScalesRadiusAt],
                    this.InnerRadius, this.InitialRotation, this.TotalAnge);

                for (const point of series.Fetch(this)) {
                    let p = scaler.ToPixelsFromCharPoint(point);

                    let dx = p.X - scaler.CenterX;
                    let dy = p.Y - scaler.CenterY;

                    if (dx > 0) {
                        if (dx > mr)
                            mr = dx;
                    } else {
                        dx *= -1;
                        if (dx > ml)
                            ml = dx;
                    }

                    if (dy > 0) {
                        if (dy > mb)
                            mb = dy;
                    } else {
                        dy *= -1;
                        if (dy > mt)
                            mt = dy;
                    }
                }
            }

            let cs = (this.ControlSize).Clone();
            let cx = cs.Width * 0.5;
            let cy = cs.Height * 0.5;

            let dl = cx - ml;
            let dr = cx - mr;
            let dt = cy - mt;
            let db = cy - mb;

            // so the idea is...

            // we know the distance of the most left point to the left border (dl)
            // the most right point to the right border (dr)
            // the most bottom point to the bottom border (db)
            // the most top point to the top border (dt)

            // then to "easily" fit the plot to the data bounds, we create a negative margin for our draw margin
            // then the scaler will luckily handle it.

            let fitMargin = new LiveChartsCore.Margin(-dl, -dt, -dr, -db);
            this.SetDrawMargin((this.ControlSize).Clone(), fitMargin);
        } else {
            // calculate draw margin
            let m = LiveChartsCore.Margin.Empty();
            let ts = 0;
            if (this.View.Title != null) {
                let titleSize = this.View.Title.Measure(this, null, null);
                m.Top = titleSize.Height;
                ts = titleSize.Height;
            }
            this.SetDrawMargin((this.ControlSize).Clone(), m);

            for (const axis of this.AngleAxes) {
                if (!axis.IsVisible) continue;

                if (axis.DataBounds.Max == axis.DataBounds.Min) {
                    let c = axis.UnitWidth * 0.5;
                    axis.DataBounds.Min = axis.DataBounds.Min - c;
                    axis.DataBounds.Max = axis.DataBounds.Max + c;
                    axis.VisibleDataBounds.Min = axis.VisibleDataBounds.Min - c;
                    axis.VisibleDataBounds.Max = axis.VisibleDataBounds.Max + c;
                }

                let drawablePlane = <LiveChartsCore.IPlane1<TDrawingContext>><unknown>axis;
                let ns = drawablePlane.GetNameLabelSize(this);
                let s = drawablePlane.GetPossibleSize(this);

                let radius = s.Height; // <- this type needs to be changed... it is not the height it is the radius.

                axis.Ro = m.Top + radius;

                m.Top += radius;
                m.Bottom += radius;
                m.Left += radius;
                m.Right += radius;
            }
            for (const axis of this.RadiusAxes) {
                if (!axis.IsVisible) continue;

                if (axis.DataBounds.Max == axis.DataBounds.Min) {
                    let c = axis.UnitWidth * 0.5;
                    axis.DataBounds.Min = axis.DataBounds.Min - c;
                    axis.DataBounds.Max = axis.DataBounds.Max + c;
                    axis.VisibleDataBounds.Min = axis.VisibleDataBounds.Min - c;
                    axis.VisibleDataBounds.Max = axis.VisibleDataBounds.Max + c;
                }

                // the angle axis does not require padding?? I think it does not
            }

            this.SetDrawMargin((this.ControlSize).Clone(), m);
        }

        // invalid dimensions, probably the chart is too small
        // or it is initializing in the UI and has no dimensions yet
        if (this.DrawMarginSize.Width <= 0 || this.DrawMarginSize.Height <= 0) return;

        this.UpdateBounds();

        let title = this.View.Title;
        if (title != null) {
            let titleSize = title.Measure(this, null, null);
            title.AlignToTopLeftCorner();
            title.X = this.ControlSize.Width * 0.5 - titleSize.Width * 0.5;
            title.Y = 0;
            this.AddVisual(title);
        }

        let totalAxes = this.RadiusAxes.Concat(this.AngleAxes).ToArray();
        for (const axis of totalAxes) {
            if (axis.DataBounds.Max == axis.DataBounds.Min) {
                let c = axis.DataBounds.Min * 0.3;
                axis.DataBounds.Min = axis.DataBounds.Min - c;
                axis.DataBounds.Max = axis.DataBounds.Max + c;
            }

            // apply padding
            if (axis.MinLimit == null) {
                // correction by geometry size
                let p = 0;
                if (axis.DataBounds.PaddingMin > p) p = axis.DataBounds.PaddingMin;
                let ce = <LiveChartsCore.ChartElement<TDrawingContext>><unknown>axis;
                ce._isInternalSet = true;
                axis.DataBounds.Min = axis.DataBounds.Min - p;
                axis.VisibleDataBounds.Min = axis.VisibleDataBounds.Min - p;
                ce._isInternalSet = false;
            }

            // apply padding
            if (axis.MaxLimit == null) {
                // correction by geometry size
                let p = 0; // Math.Abs(s.ToChartValues(axis.DataBounds.RequestedGeometrySize) - s.ToChartValues(0));
                if (axis.DataBounds.PaddingMax > p) p = axis.DataBounds.PaddingMax;
                let ce = <LiveChartsCore.ChartElement<TDrawingContext>><unknown>axis;
                ce._isInternalSet = true;
                axis.DataBounds.Max = axis.DataBounds.Max + p;
                axis.VisibleDataBounds.Max = axis.VisibleDataBounds.Max + p;
                ce._isInternalSet = false;
            }

            if (axis.IsVisible) this.AddVisual(<LiveChartsCore.ChartElement<TDrawingContext>><unknown>axis);
            (<LiveChartsCore.ChartElement<TDrawingContext>><unknown>axis).RemoveOldPaints(this.View); // <- this is probably obsolete.
            // the probable issue is the "IsVisible" property
        }

        for (const visual of this.VisualElements) this.AddVisual(visual);
        for (const series of this.Series) this.AddVisual(<LiveChartsCore.ChartElement<TDrawingContext>><unknown>series);

        this.CollectVisuals();

        for (const axis of totalAxes) {
            if (!axis.IsVisible) continue;

            let ce = <LiveChartsCore.ChartElement<TDrawingContext>><unknown>axis;
            ce._isInternalSet = true;
            axis.ActualBounds.HasPreviousState = true;
            ce._isInternalSet = false;
        }

        this.InvokeOnUpdateStarted();

        this.IsFirstDraw = false;
        this.ThemeId = LiveChartsCore.LiveCharts.DefaultSettings.CurrentThemeId;
        this.PreviousSeriesAtLegend = this.Series.Where(x => x.IsVisibleAtLegend).ToArray();
        this.PreviousLegendPosition = this.LegendPosition;

        this.Canvas.Invalidate();
    }

    public ScaleUIPoint(point: LiveChartsCore.LvcPoint, angleAxisIndex: number = 0, radiusAxisIndex: number = 0): Float64Array {
        let angleAxis = this.AngleAxes[angleAxisIndex];
        let radiusAxis = this.RadiusAxes[radiusAxisIndex];

        let scaler = new LiveChartsCore.PolarScaler((this.DrawMarginLocation).Clone(), (this.DrawMarginSize).Clone(), angleAxis, radiusAxis,
            this.InnerRadius, this.InitialRotation, this.TotalAnge);

        let r = scaler.ToChartValues(point.X, point.Y);

        return new Float64Array([r.X, r.Y]);
    }

    public Unload() {
        super.Unload();
        this.IsFirstDraw = true;
    }
}
