import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class CartesianChart<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.Chart<TDrawingContext> {
    private readonly _chartView: LiveChartsCore.ICartesianChartView<TDrawingContext>;
    private readonly _zoomingSection: LiveChartsCore.ISizedGeometry<TDrawingContext>;
    private _nextSeries: number = 0;
    private _zoomingSpeed: number = 0;
    private _zoomMode: LiveChartsCore.ZoomAndPanMode = 0;
    private _previousDrawMarginFrame: Nullable<LiveChartsCore.DrawMarginFrame<TDrawingContext>>;
    private static readonly MaxAxisBound: number = 0.05;
    private static readonly MaxAxisActiveBound: number = 0.15;
    private _crosshair: System.HashSet<LiveChartsCore.ICartesianAxis1<TDrawingContext>> = new System.HashSet();

    public constructor(
        view: LiveChartsCore.ICartesianChartView<TDrawingContext>,
        defaultPlatformConfig: System.Action1<LiveChartsCore.LiveChartsSettings>,
        canvas: LiveChartsCore.MotionCanvas<TDrawingContext>,
        zoomingSection: Nullable<LiveChartsCore.ISizedGeometry<TDrawingContext>>) {
        super(canvas, defaultPlatformConfig, view);
        if (zoomingSection == null)
            throw new System.Exception(`${"zoomingSection"} is required.`);
        this._chartView = view;
        this._zoomingSection = zoomingSection;
        this._zoomingSection.X = -1;
        this._zoomingSection.Y = -1;
        this._zoomingSection.Width = 0;
        this._zoomingSection.Height = 0;
    }

    #XAxes: LiveChartsCore.ICartesianAxis1<TDrawingContext>[] = [];
    public get XAxes() {
        return this.#XAxes;
    }

    private set XAxes(value) {
        this.#XAxes = value;
    }

    #YAxes: LiveChartsCore.ICartesianAxis1<TDrawingContext>[] = [];
    public get YAxes() {
        return this.#YAxes;
    }

    private set YAxes(value) {
        this.#YAxes = value;
    }

    #Series: LiveChartsCore.ICartesianSeries<TDrawingContext>[] = [];
    public get Series() {
        return this.#Series;
    }

    private set Series(value) {
        this.#Series = value;
    }

    #Sections: LiveChartsCore.Section<TDrawingContext>[] = [];
    public get Sections() {
        return this.#Sections;
    }

    private set Sections(value) {
        this.#Sections = value;
    }

    public get ChartSeries(): System.IEnumerable<LiveChartsCore.IChartSeries<TDrawingContext>> {
        return this.Series;
    }

    #IsZoomingOrPanning: boolean = false;
    public get IsZoomingOrPanning() {
        return this.#IsZoomingOrPanning;
    }

    private set IsZoomingOrPanning(value) {
        this.#IsZoomingOrPanning = value;
    }

    public get View(): LiveChartsCore.IChartView1<TDrawingContext> {
        return this._chartView;
    }

    public FindHoveredPointsBy(pointerPosition: LiveChartsCore.LvcPoint): System.IEnumerable<LiveChartsCore.ChartPoint> {
        let actualStrategy = this.TooltipFindingStrategy;

        if (actualStrategy == LiveChartsCore.TooltipFindingStrategy.Automatic)
            actualStrategy = LiveChartsCore.Extensions.GetTooltipFindingStrategy(this.Series,);

        return this.ChartSeries
            .Where(series => series.IsHoverable)
            .SelectMany(series => series.FindHitPoints(this, (pointerPosition).Clone(), actualStrategy));
    }

    public ScaleUIPoint(point: LiveChartsCore.LvcPoint, xAxisIndex: number = 0, yAxisIndex: number = 0): Float64Array {
        let xAxis = this.XAxes[xAxisIndex];
        let yAxis = this.YAxes[yAxisIndex];

        let xScaler = LiveChartsCore.Scaler.Make((this.DrawMarginLocation).Clone(), (this.DrawMarginSize).Clone(), xAxis);
        let yScaler = LiveChartsCore.Scaler.Make((this.DrawMarginLocation).Clone(), (this.DrawMarginSize).Clone(), yAxis);

        return new Float64Array([xScaler.ToChartValues(point.X), yScaler.ToChartValues(point.Y)]);
    }

    public Zoom(pivot: LiveChartsCore.LvcPoint, direction: LiveChartsCore.ZoomDirection, scaleFactor: Nullable<number> = null, isActive: boolean = false) {
        if (this.YAxes == null || this.XAxes == null) return;

        let speed = this._zoomingSpeed < 0.1 ? 0.1 : (this._zoomingSpeed > 0.95 ? 0.95 : this._zoomingSpeed);
        speed = 1 - speed;

        if (scaleFactor != null && direction != LiveChartsCore.ZoomDirection.DefinedByScaleFactor)
            throw new System.InvalidOperationException(`When the scale factor is defined, the zoom direction must be ${"ZoomDirection.DefinedByScaleFactor"}... ` +
                `it just makes sense.`);

        let m = direction == LiveChartsCore.ZoomDirection.ZoomIn ? speed : 1 / speed;

        if ((this._zoomMode & LiveChartsCore.ZoomAndPanMode.X) == LiveChartsCore.ZoomAndPanMode.X) {
            for (let index = 0; index < this.XAxes.length; index++) {
                let xi = this.XAxes[index];
                let px = LiveChartsCore.Scaler.Make((this.DrawMarginLocation).Clone(), (this.DrawMarginSize).Clone(), xi).ToChartValues(pivot.X);

                let max = xi.MaxLimit == null ? xi.DataBounds.Max : xi.MaxLimit;
                let min = xi.MinLimit == null ? xi.DataBounds.Min : xi.MinLimit;

                let mint: number = 0;
                let maxt: number = 0;
                let l = max - min;

                if (scaleFactor == null) {
                    let rMin = (px - min) / l;
                    let rMax = 1 - rMin;

                    let target = l * m;

                    mint = px - target * rMin;
                    maxt = px + target * rMax;
                } else {
                    let delta = 1 - scaleFactor;
                    let dir: number = 0;

                    if (delta < 0) {
                        dir = -1;
                        direction = LiveChartsCore.ZoomDirection.ZoomIn;
                    } else {
                        dir = 1;
                        direction = LiveChartsCore.ZoomDirection.ZoomOut;
                    }

                    let ld = l * Math.abs(delta);
                    mint = min - ld * 0.5 * dir;
                    maxt = max + ld * 0.5 * dir;
                }

                let minZoomDelta = xi.MinZoomDelta ?? xi.DataBounds.MinDelta * 3;
                if (direction == LiveChartsCore.ZoomDirection.ZoomIn && maxt - mint < minZoomDelta) continue;

                let xm = (max - min) * (isActive ? CartesianChart.MaxAxisActiveBound : CartesianChart.MaxAxisBound);
                if (maxt > xi.DataBounds.Max && direction == LiveChartsCore.ZoomDirection.ZoomOut) maxt = xi.DataBounds.Max + xm;
                if (mint < xi.DataBounds.Min && direction == LiveChartsCore.ZoomDirection.ZoomOut) mint = xi.DataBounds.Min - xm;

                xi.MaxLimit = maxt;
                xi.MinLimit = mint;
            }
        }

        if ((this._zoomMode & LiveChartsCore.ZoomAndPanMode.Y) == LiveChartsCore.ZoomAndPanMode.Y) {
            for (let index = 0; index < this.YAxes.length; index++) {
                let yi = this.YAxes[index];
                let px = LiveChartsCore.Scaler.Make((this.DrawMarginLocation).Clone(), (this.DrawMarginSize).Clone(), yi).ToChartValues(pivot.Y);

                let max = yi.MaxLimit == null ? yi.DataBounds.Max : yi.MaxLimit;
                let min = yi.MinLimit == null ? yi.DataBounds.Min : yi.MinLimit;

                let mint: number = 0;
                let maxt: number = 0;
                let l = max - min;

                if (scaleFactor == null) {
                    let rMin = (px - min) / l;
                    let rMax = 1 - rMin;

                    let target = l * m;
                    mint = px - target * rMin;
                    maxt = px + target * rMax;
                } else {
                    let delta = 1 - scaleFactor;
                    let dir: number = 0;

                    if (delta < 0) {
                        dir = -1;
                        direction = LiveChartsCore.ZoomDirection.ZoomIn;
                    } else {
                        dir = 1;
                        direction = LiveChartsCore.ZoomDirection.ZoomOut;
                    }

                    let ld = l * Math.abs(delta);
                    mint = min - ld * 0.5 * dir;
                    maxt = max + ld * 0.5 * dir;
                }

                let minZoomDelta = yi.MinZoomDelta ?? yi.DataBounds.MinDelta * 3;
                if (direction == LiveChartsCore.ZoomDirection.ZoomIn && maxt - mint < minZoomDelta) continue;

                let ym = (max - min) * (isActive ? CartesianChart.MaxAxisActiveBound : CartesianChart.MaxAxisBound);
                if (maxt > yi.DataBounds.Max && direction == LiveChartsCore.ZoomDirection.ZoomOut) maxt = yi.DataBounds.Max + ym;
                if (mint < yi.DataBounds.Min && direction == LiveChartsCore.ZoomDirection.ZoomOut) mint = yi.DataBounds.Min - ym;

                yi.MaxLimit = maxt;
                yi.MinLimit = mint;
            }
        }

        this.IsZoomingOrPanning = true;
    }

    public Pan(delta: LiveChartsCore.LvcPoint, isActive: boolean) {
        if ((this._zoomMode & LiveChartsCore.ZoomAndPanMode.X) == LiveChartsCore.ZoomAndPanMode.X) {
            for (let index = 0; index < this.XAxes.length; index++) {
                let xi = this.XAxes[index];
                let scale = LiveChartsCore.Scaler.Make((this.DrawMarginLocation).Clone(), (this.DrawMarginSize).Clone(), xi);
                let dx = scale.ToChartValues(-delta.X) - scale.ToChartValues(0);

                let max = xi.MaxLimit == null ? xi.DataBounds.Max : xi.MaxLimit;
                let min = xi.MinLimit == null ? xi.DataBounds.Min : xi.MinLimit;

                let xm = max - min;
                xm = isActive ? xm * CartesianChart.MaxAxisActiveBound : xm * CartesianChart.MaxAxisBound;

                if (max + dx > xi.DataBounds.Max && delta.X < 0) {
                    xi.MaxLimit = xi.DataBounds.Max + xm;
                    xi.MinLimit = xi.DataBounds.Max - (max - xm - min);
                    continue;
                }

                if (min + dx < xi.DataBounds.Min && delta.X > 0) {
                    xi.MinLimit = xi.DataBounds.Min - xm;
                    xi.MaxLimit = xi.DataBounds.Min + max - min - xm;
                    continue;
                }

                xi.MaxLimit = max + dx;
                xi.MinLimit = min + dx;
            }
        }

        if ((this._zoomMode & LiveChartsCore.ZoomAndPanMode.Y) == LiveChartsCore.ZoomAndPanMode.Y) {
            for (let index = 0; index < this.YAxes.length; index++) {
                let yi = this.YAxes[index];
                let scale = LiveChartsCore.Scaler.Make((this.DrawMarginLocation).Clone(), (this.DrawMarginSize).Clone(), yi);
                let dy = -(scale.ToChartValues(delta.Y) - scale.ToChartValues(0));

                let max = yi.MaxLimit == null ? yi.DataBounds.Max : yi.MaxLimit;
                let min = yi.MinLimit == null ? yi.DataBounds.Min : yi.MinLimit;

                let ym = max - min;
                ym = isActive ? ym * CartesianChart.MaxAxisActiveBound : ym * CartesianChart.MaxAxisBound;

                if (max + dy > yi.DataBounds.Max) {
                    yi.MaxLimit = yi.DataBounds.Max + ym;
                    yi.MinLimit = yi.DataBounds.Max - (max - ym - min);
                    continue;
                }

                if (min + dy < yi.DataBounds.Min) {
                    yi.MinLimit = yi.DataBounds.Min - ym;
                    yi.MaxLimit = yi.DataBounds.Min + max - min - ym;
                    continue;
                }

                yi.MaxLimit = max + dy;
                yi.MinLimit = min + dy;
            }
        }

        this.IsZoomingOrPanning = true;
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

        this.YAxes = this._chartView.YAxes.Cast<LiveChartsCore.ICartesianAxis1<TDrawingContext>>().Select(x => x).ToArray();
        this.XAxes = this._chartView.XAxes.Cast<LiveChartsCore.ICartesianAxis1<TDrawingContext>>().Select(x => x).ToArray();

        this._zoomingSpeed = this._chartView.ZoomingSpeed;
        this._zoomMode = this._chartView.ZoomMode;

        let theme = LiveChartsCore.LiveCharts.DefaultSettings.GetTheme<TDrawingContext>();

        this.LegendPosition = this._chartView.LegendPosition;
        this.Legend = this._chartView.Legend;

        this.TooltipPosition = this._chartView.TooltipPosition;
        this.TooltipFindingStrategy = this._chartView.TooltipFindingStrategy;
        this.Tooltip = this._chartView.Tooltip;

        this.AnimationsSpeed = this._chartView.AnimationsSpeed;
        this.EasingFunction = this._chartView.EasingFunction;

        //var actualSeries = (_chartView.Series ?? Enumerable.Empty<ISeries>()).Where(x => x.IsVisible);
        let actualSeries: System.IEnumerable<LiveChartsCore.ISeries> = this._chartView.Series == null
            ? [] : this._chartView.Series.Where(x => x.IsVisible);

        this.Series = actualSeries
            .Cast<LiveChartsCore.ICartesianSeries<TDrawingContext>>()
            .ToArray();

        this.Sections = this._chartView.Sections?.Where(x => x.IsVisible).ToArray() ?? [];
        this.VisualElements = this._chartView.VisualElements?.ToArray() ?? [];


        this.SeriesContext = new LiveChartsCore.SeriesContext<TDrawingContext>(this.Series);
        let isNewTheme = LiveChartsCore.LiveCharts.DefaultSettings.CurrentThemeId != this.ThemeId;

        // restart axes bounds and meta data
        for (const axis of this.XAxes) {
            let ce = <LiveChartsCore.ChartElement<TDrawingContext>><unknown>axis;
            ce._isInternalSet = true;
            axis.Initialize(LiveChartsCore.AxisOrientation.X);
            if (!ce._isThemeSet || isNewTheme) {
                theme.ApplyStyleToAxis(<LiveChartsCore.IPlane1<TDrawingContext>><unknown>axis);
                ce._isThemeSet = true;
            }
            ce._isInternalSet = false;
            if (axis.CrosshairPaint != null) this._crosshair.Add(axis);
        }
        for (const axis of this.YAxes) {
            let ce = <LiveChartsCore.ChartElement<TDrawingContext>><unknown>axis;
            ce._isInternalSet = true;
            axis.Initialize(LiveChartsCore.AxisOrientation.Y);
            if (!ce._isThemeSet || isNewTheme) {
                theme.ApplyStyleToAxis(<LiveChartsCore.IPlane1<TDrawingContext>><unknown>axis);
                ce._isThemeSet = true;
            }
            ce._isInternalSet = false;
            if (axis.CrosshairPaint != null) this._crosshair.Add(axis);
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

            let xAxis = this.XAxes[series.ScalesXAt];
            let yAxis = this.YAxes[series.ScalesYAt];

            let seriesBounds = series.GetBounds(this, xAxis, yAxis).Bounds;
            if (seriesBounds.IsEmpty) continue;

            xAxis.DataBounds.AppendValueByBounds(seriesBounds.SecondaryBounds);
            yAxis.DataBounds.AppendValueByBounds(seriesBounds.PrimaryBounds);
            xAxis.VisibleDataBounds.AppendValueByBounds(seriesBounds.VisibleSecondaryBounds);
            yAxis.VisibleDataBounds.AppendValueByBounds(seriesBounds.VisiblePrimaryBounds);

            ce._isInternalSet = false;
        }


        // prevent the bounds are not empty...

        for (const axis of this.XAxes) {
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
        for (const axis of this.YAxes) {
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
        let title = this.View.Title;
        let m = LiveChartsCore.Margin.Empty();
        let ts: number = 0;
        let bs: number = 0;
        let ls: number = 0;
        let rs: number = 0;
        if (title != null) {
            let titleSize = title.Measure(this, null, null);
            m.Top = titleSize.Height;
            ts = titleSize.Height;
        }
        this.SetDrawMargin((this.ControlSize).Clone(), m);

        for (const axis of this.XAxes) {
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
            axis.Size = (s).Clone();

            if (axis.Position == LiveChartsCore.AxisPosition.Start) {
                if (axis.InLineNamePlacement) {
                    let h = s.Height > ns.Height ? s.Height : ns.Height;

                    // X Bottom
                    axis.NameDesiredSize = new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(0, this.ControlSize.Height - h), new LiveChartsCore.LvcSize(ns.Width, h));
                    axis.LabelsDesiredSize = new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(0, axis.NameDesiredSize.Y - h), new LiveChartsCore.LvcSize(this.ControlSize.Width, s.Height));

                    axis.Yo = m.Bottom + h * 0.5;
                    bs = h;
                    m.Bottom = bs;
                    m.Left = ns.Width;
                } else {
                    // X Bottom
                    axis.NameDesiredSize = new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(0, this.ControlSize.Height - bs - ns.Height), new LiveChartsCore.LvcSize(this.ControlSize.Width, ns.Height));
                    axis.LabelsDesiredSize = new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(0, axis.NameDesiredSize.Y - s.Height), new LiveChartsCore.LvcSize(this.ControlSize.Width, s.Height));

                    axis.Yo = m.Bottom + s.Height * 0.5 + ns.Height;
                    bs += s.Height + ns.Height;
                    m.Bottom = bs;
                    if (s.Width * 0.5 > m.Left) m.Left = s.Width * 0.5;
                    if (s.Width * 0.5 > m.Right) m.Right = s.Width * 0.5;
                }
            } else {
                if (axis.InLineNamePlacement) {
                    let h = s.Height > ns.Height ? s.Height : ns.Height;

                    // X Bottom
                    axis.NameDesiredSize = new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(0, 0), new LiveChartsCore.LvcSize(ns.Width, h));
                    axis.LabelsDesiredSize = new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(0, axis.NameDesiredSize.Y - h), new LiveChartsCore.LvcSize(this.ControlSize.Width, s.Height));

                    axis.Yo = m.Top + h * 0.5;
                    ts = h;
                    m.Top = ts;
                    m.Left = ns.Width;
                } else {
                    // X Top
                    axis.NameDesiredSize = new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(0, ts), new LiveChartsCore.LvcSize(this.ControlSize.Width, ns.Height));
                    axis.LabelsDesiredSize = new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(0, ts + ns.Height), new LiveChartsCore.LvcSize(this.ControlSize.Width, s.Height));

                    axis.Yo = ts + s.Height * 0.5 + ns.Height;
                    ts += s.Height + ns.Height;
                    m.Top = ts;
                    if (ls + s.Width * 0.5 > m.Left) m.Left = ls + s.Width * 0.5;
                    if (rs + s.Width * 0.5 > m.Right) m.Right = rs + s.Width * 0.5;
                }
            }
        }
        for (const axis of this.YAxes) {
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
            axis.Size = (s).Clone();
            let w = s.Width;

            if (axis.Position == LiveChartsCore.AxisPosition.Start) {
                if (axis.InLineNamePlacement) {
                    if (w < ns.Width) w = ns.Width;

                    // Y Left
                    axis.NameDesiredSize = new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(ls, 0), new LiveChartsCore.LvcSize(ns.Width, ns.Height));
                    axis.LabelsDesiredSize = new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(ls, 0), new LiveChartsCore.LvcSize(s.Width, this.ControlSize.Height));

                    axis.Xo = ls + w * 0.5;
                    ls += w;
                    m.Top = ns.Height;
                    m.Left = ls;
                } else {
                    // Y Left
                    axis.NameDesiredSize = new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(ls, 0), new LiveChartsCore.LvcSize(ns.Width, this.ControlSize.Height));
                    axis.LabelsDesiredSize = new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(ls + ns.Width, 0), new LiveChartsCore.LvcSize(s.Width, this.ControlSize.Height));

                    axis.Xo = ls + w * 0.5 + ns.Width;
                    ls += w + ns.Width;
                    m.Left = ls;
                    if (s.Height * 0.5 > m.Top) {
                        m.Top = s.Height * 0.5;
                    }
                    if (s.Height * 0.5 > m.Bottom) {
                        m.Bottom = s.Height * 0.5;
                    }
                }
            } else {
                if (axis.InLineNamePlacement) {
                    if (w < ns.Width) w = ns.Width;

                    // Y Left
                    axis.NameDesiredSize = new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(this.ControlSize.Width - rs - ns.Width, 0), new LiveChartsCore.LvcSize(ns.Width, ns.Height));
                    axis.LabelsDesiredSize = new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(axis.NameDesiredSize.X - s.Width, 0), new LiveChartsCore.LvcSize(s.Width, this.ControlSize.Height));

                    axis.Xo = rs + w * 0.5;
                    rs += w;
                    m.Top = ns.Height;
                    m.Right = rs;
                } else {
                    // Y Right
                    axis.NameDesiredSize = new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(this.ControlSize.Width - rs - ns.Width, 0), new LiveChartsCore.LvcSize(ns.Width, this.ControlSize.Height));
                    axis.LabelsDesiredSize = new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(axis.NameDesiredSize.X - s.Width, 0), new LiveChartsCore.LvcSize(s.Width, this.ControlSize.Height));

                    axis.Xo = rs + w * 0.5 + ns.Width;
                    rs += w + ns.Width;
                    m.Right = rs;
                    if (ts + s.Height * 0.5 > m.Top) m.Top = ts + s.Height * 0.5;
                    if (bs + s.Height * 0.5 > m.Bottom) m.Bottom = bs + s.Height * 0.5;
                }
            }
        }

        let rm = viewDrawMargin ?? LiveChartsCore.Margin.All(LiveChartsCore.Margin.Auto);

        let actualMargin = new LiveChartsCore.Margin(LiveChartsCore.Margin.IsAuto(rm.Left) ? m.Left : rm.Left,
            LiveChartsCore.Margin.IsAuto(rm.Top) ? m.Top : rm.Top,
            LiveChartsCore.Margin.IsAuto(rm.Right) ? m.Right : rm.Right,
            LiveChartsCore.Margin.IsAuto(rm.Bottom) ? m.Bottom : rm.Bottom);

        this.SetDrawMargin((this.ControlSize).Clone(), actualMargin);

        // invalid dimensions, probably the chart is too small
        // or it is initializing in the UI and has no dimensions yet
        if (this.DrawMarginSize.Width <= 0 || this.DrawMarginSize.Height <= 0) return;

        this.UpdateBounds();

        if (title != null) {
            let titleSize = title.Measure(this, null, null);
            title.AlignToTopLeftCorner();
            title.X = this.ControlSize.Width * 0.5 - titleSize.Width * 0.5;
            title.Y = 0;
            this.AddVisual(title);
        }

        let totalAxes = this.XAxes.Concat(this.YAxes).ToArray();

        for (const axis of totalAxes) {
            if (axis.DataBounds.Max == axis.DataBounds.Min) {
                let c = axis.DataBounds.Min * 0.3;
                axis.DataBounds.Min = axis.DataBounds.Min - c;
                axis.DataBounds.Max = axis.DataBounds.Max + c;
            }

            // apply padding
            if (axis.MinLimit == null) {
                let s = LiveChartsCore.Scaler.Make((this.DrawMarginLocation).Clone(), (this.DrawMarginSize).Clone(), axis);
                // correction by geometry size
                let p = Math.abs(s.ToChartValues(axis.DataBounds.RequestedGeometrySize) - s.ToChartValues(0));
                if (axis.DataBounds.PaddingMin > p) p = axis.DataBounds.PaddingMin;
                let ce = <LiveChartsCore.ChartElement<TDrawingContext>><unknown>axis;
                ce._isInternalSet = true;
                axis.DataBounds.Min = axis.DataBounds.Min - p;
                axis.VisibleDataBounds.Min = axis.VisibleDataBounds.Min - p;
                ce._isInternalSet = false;
            }

            // apply padding
            if (axis.MaxLimit == null) {
                let s = LiveChartsCore.Scaler.Make((this.DrawMarginLocation).Clone(), (this.DrawMarginSize).Clone(), axis);
                // correction by geometry size
                let p = Math.abs(s.ToChartValues(axis.DataBounds.RequestedGeometrySize) - s.ToChartValues(0));
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
        for (const section of this.Sections) this.AddVisual(section);
        for (const visual of this.VisualElements) this.AddVisual(visual);
        for (const series of this.Series) this.AddVisual(<LiveChartsCore.ChartElement<TDrawingContext>><unknown>series);

        if (this._previousDrawMarginFrame != null && this._chartView.DrawMarginFrame != this._previousDrawMarginFrame) {
            // probably obsolete?
            // this should be handled by the RegisterAndInvalidateVisual() method.
            this._previousDrawMarginFrame.RemoveFromUI(this);
            this._previousDrawMarginFrame = null;
        }
        if (this._chartView.DrawMarginFrame != null) {
            this.AddVisual(this._chartView.DrawMarginFrame);
            this._previousDrawMarginFrame = this._chartView.DrawMarginFrame;
        }

        this.CollectVisuals();

        for (const axis of totalAxes) {
            if (!axis.IsVisible) continue;

            let ce = <LiveChartsCore.ChartElement<TDrawingContext>><unknown>axis;
            ce._isInternalSet = true;
            axis.ActualBounds.HasPreviousState = true;
            ce._isInternalSet = false;
        }

        this.ActualBounds.HasPreviousState = true;

        this.IsZoomingOrPanning = false;
        this.InvokeOnUpdateStarted();

        this.IsFirstDraw = false;
        this.ThemeId = LiveChartsCore.LiveCharts.DefaultSettings.CurrentThemeId;
        this.PreviousSeriesAtLegend = this.Series.Where(x => x.IsVisibleAtLegend).ToArray();
        this.PreviousLegendPosition = this.LegendPosition;

        this.Canvas.Invalidate();
    }

    public Unload() {
        super.Unload();
        this._crosshair = new System.HashSet();
        this.IsFirstDraw = true;
    }

    private _sectionZoomingStart: Nullable<LiveChartsCore.LvcPoint> = null;

    public InvokePointerDown(point: LiveChartsCore.LvcPoint, isSecondaryAction: boolean) {
        if (isSecondaryAction && this._zoomMode != LiveChartsCore.ZoomAndPanMode.None) {
            this._sectionZoomingStart = (point).Clone();

            let x = point.X;
            let y = point.Y;

            if (x < this.DrawMarginLocation.X || x > this.DrawMarginLocation.X + this.DrawMarginSize.Width ||
                y < this.DrawMarginLocation.Y || y > this.DrawMarginLocation.Y + this.DrawMarginSize.Height) {
                this._sectionZoomingStart = null;
                return;
            }

            this._zoomingSection.X = x;
            this._zoomingSection.Y = y;

            let xMode = (this._zoomMode & LiveChartsCore.ZoomAndPanMode.X) == LiveChartsCore.ZoomAndPanMode.X;
            let yMode = (this._zoomMode & LiveChartsCore.ZoomAndPanMode.Y) == LiveChartsCore.ZoomAndPanMode.Y;

            if (!xMode) {
                this._zoomingSection.X = this.DrawMarginLocation.X;
                this._zoomingSection.Width = this.DrawMarginSize.Width;
            }

            if (!yMode) {
                this._zoomingSection.Y = this.DrawMarginLocation.Y;
                this._zoomingSection.Height = this.DrawMarginSize.Height;
            }

            return;
        }
        super.InvokePointerDown((point).Clone(), isSecondaryAction);
    }

    public InvokePointerMove(point: LiveChartsCore.LvcPoint) {
        for (const axis of this._crosshair) {
            axis.InvalidateCrosshair(this, (point).Clone());
        }

        if (this._sectionZoomingStart != null) {
            let xMode = (this._zoomMode & LiveChartsCore.ZoomAndPanMode.X) == LiveChartsCore.ZoomAndPanMode.X;
            let yMode = (this._zoomMode & LiveChartsCore.ZoomAndPanMode.Y) == LiveChartsCore.ZoomAndPanMode.Y;

            let x = point.X;
            let y = point.Y;

            if (x < this.DrawMarginLocation.X) x = this.DrawMarginLocation.X;
            if (x > this.DrawMarginLocation.X + this.DrawMarginSize.Width) x = this.DrawMarginLocation.X + this.DrawMarginSize.Width;
            if (y < this.DrawMarginLocation.Y) y = this.DrawMarginLocation.Y;
            if (y > this.DrawMarginLocation.Y + this.DrawMarginSize.Height) y = this.DrawMarginLocation.Y + this.DrawMarginSize.Height;

            if (xMode) this._zoomingSection.Width = x - this._sectionZoomingStart.X;
            if (yMode) this._zoomingSection.Height = y - this._sectionZoomingStart.Y;

            this.Canvas.Invalidate();
            return;
        }

        super.InvokePointerMove((point).Clone());
    }

    public InvokePointerUp(point: LiveChartsCore.LvcPoint, isSecondaryAction: boolean) {
        if (this._sectionZoomingStart != null) {
            let xy = Math.sqrt(Math.pow(point.X - this._sectionZoomingStart.X, 2) + Math.pow(point.Y - this._sectionZoomingStart.Y, 2));
            if (xy < 15) {
                this._zoomingSection.X = -1;
                this._zoomingSection.Y = -1;
                this._zoomingSection.Width = 0;
                this._zoomingSection.Height = 0;
                this.Update();
                this._sectionZoomingStart = null;
                return;
            }

            if ((this._zoomMode & LiveChartsCore.ZoomAndPanMode.X) == LiveChartsCore.ZoomAndPanMode.X) {
                for (let i = 0; i < this.XAxes.length; i++) {
                    let x = this.XAxes[i];

                    let xi = this.ScaleUIPoint((this._sectionZoomingStart).Clone(), i, 0)[0];
                    let xj = this.ScaleUIPoint((point).Clone(), i, 0)[0];

                    let xMax: number = 0;
                    let xMin: number = 0;

                    if (xi > xj) {
                        xMax = xi;
                        xMin = xj;
                    } else {
                        xMax = xj;
                        xMin = xi;
                    }

                    if (xMax > (x.MaxLimit ?? Number.MAX_VALUE)) xMax = x.MaxLimit ?? Number.MAX_VALUE;
                    if (xMin < (x.MinLimit ?? Number.MIN_VALUE)) xMin = x.MinLimit ?? Number.MIN_VALUE;

                    let min = x.MinZoomDelta ?? x.DataBounds.MinDelta * 3;

                    if (xMax - xMin > min) {
                        x.MinLimit = xMin;
                        x.MaxLimit = xMax;
                    } else {
                        if (x.MaxLimit != null && x.MinLimit != null) {
                            let d = xMax - xMin;
                            let ad = x.MaxLimit - x.MinLimit;
                            let c = (ad - d) * 0.5;

                            x.MinLimit = xMin - c;
                            x.MaxLimit = xMax + c;
                        }
                    }
                }
            }

            if ((this._zoomMode & LiveChartsCore.ZoomAndPanMode.Y) == LiveChartsCore.ZoomAndPanMode.Y) {
                for (let i = 0; i < this.YAxes.length; i++) {
                    let y = this.YAxes[i];

                    let yi = this.ScaleUIPoint((this._sectionZoomingStart).Clone(), 0, i)[1];
                    let yj = this.ScaleUIPoint((point).Clone(), 0, i)[1];

                    let yMax: number = 0;
                    let yMin: number = 0;

                    if (yi > yj) {
                        yMax = yi;
                        yMin = yj;
                    } else {
                        yMax = yj;
                        yMin = yi;
                    }

                    if (yMax > (y.MaxLimit ?? Number.MAX_VALUE)) yMax = y.MaxLimit ?? Number.MAX_VALUE;
                    if (yMin < (y.MinLimit ?? Number.MIN_VALUE)) yMin = y.MinLimit ?? Number.MIN_VALUE;

                    let min = y.MinZoomDelta ?? y.DataBounds.MinDelta * 3;

                    if (yMax - yMin > min) {
                        y.MinLimit = yMin;
                        y.MaxLimit = yMax;
                    } else {
                        if (y.MaxLimit != null && y.MinLimit != null) {
                            let d = yMax - yMin;
                            let ad = y.MaxLimit - y.MinLimit;
                            let c = (ad - d) * 0.5;

                            y.MinLimit = yMin - c;
                            y.MaxLimit = yMax + c;
                        }
                    }
                }
            }

            this._zoomingSection.X = -1;
            this._zoomingSection.Y = -1;
            this._zoomingSection.Width = 0;
            this._zoomingSection.Height = 0;
            this._sectionZoomingStart = null;
            return;
        }

        super.InvokePointerUp((point).Clone(), isSecondaryAction);
    }
}
