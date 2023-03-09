import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class PieChart<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.Chart<TDrawingContext> {
    private readonly _chartView: LiveChartsCore.IPieChartView<TDrawingContext>;
    private _nextSeries: number = 0;
    private readonly _requiresLegendMeasureAlways: boolean = false;

    public constructor(
        view: LiveChartsCore.IPieChartView<TDrawingContext>,
        defaultPlatformConfig: System.Action1<LiveChartsCore.LiveChartsSettings>,
        canvas: LiveChartsCore.MotionCanvas<TDrawingContext>,
        requiresLegendMeasureAlways: boolean = false) {
        super(canvas, defaultPlatformConfig, view);
        this._chartView = view;
        this._requiresLegendMeasureAlways = requiresLegendMeasureAlways;
    }

    #Series: LiveChartsCore.IPieSeries<TDrawingContext>[] = [];
    public get Series() {
        return this.#Series;
    }

    private set Series(value) {
        this.#Series = value;
    }

    public get ChartSeries(): System.IEnumerable<LiveChartsCore.IChartSeries<TDrawingContext>> {
        return this.Series.Where(x => !x.IsFillSeries);
    }

    public get View(): LiveChartsCore.IChartView1<TDrawingContext> {
        return this._chartView;
    }

    #ValueBounds: LiveChartsCore.Bounds = new LiveChartsCore.Bounds();
    public get ValueBounds() {
        return this.#ValueBounds;
    }

    private set ValueBounds(value) {
        this.#ValueBounds = value;
    }

    #IndexBounds: LiveChartsCore.Bounds = new LiveChartsCore.Bounds();
    public get IndexBounds() {
        return this.#IndexBounds;
    }

    private set IndexBounds(value) {
        this.#IndexBounds = value;
    }

    #PushoutBounds: LiveChartsCore.Bounds = new LiveChartsCore.Bounds();
    public get PushoutBounds() {
        return this.#PushoutBounds;
    }

    private set PushoutBounds(value) {
        this.#PushoutBounds = value;
    }

    public FindHoveredPointsBy(pointerPosition: LiveChartsCore.LvcPoint): System.IEnumerable<LiveChartsCore.ChartPoint> {
        return this._chartView.Series
            .Where(series => LiveChartsCore.IsInterfaceOfIPieSeries(series) && !(<LiveChartsCore.IPieSeries<TDrawingContext>><unknown>series).IsFillSeries)
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

        //var actualSeries = (_chartView.Series ?? Enumerable.Empty<ISeries>()).Where(x => x.IsVisible);
        let actualSeries: System.IEnumerable<LiveChartsCore.ISeries> = this._chartView.Series == null
            ? [] : this._chartView.Series.Where(x => x.IsVisible);

        this.Series = actualSeries
            .Cast<LiveChartsCore.IPieSeries<TDrawingContext>>()
            .ToArray();

        this.VisualElements = this._chartView.VisualElements?.ToArray() ?? [];

        this.LegendPosition = this._chartView.LegendPosition;
        this.Legend = this._chartView.Legend;

        this.TooltipPosition = this._chartView.TooltipPosition;
        this.Tooltip = this._chartView.Tooltip;

        this.AnimationsSpeed = this._chartView.AnimationsSpeed;
        this.EasingFunction = this._chartView.EasingFunction;

        this.SeriesContext = new LiveChartsCore.SeriesContext<TDrawingContext>(this.Series);
        let isNewTheme = LiveChartsCore.LiveCharts.DefaultSettings.CurrentThemeId != this.ThemeId;

        let theme = LiveChartsCore.LiveCharts.DefaultSettings.GetTheme<TDrawingContext>();

        this.ValueBounds = new LiveChartsCore.Bounds();
        this.IndexBounds = new LiveChartsCore.Bounds();
        this.PushoutBounds = new LiveChartsCore.Bounds();

        for (const series of this.Series) {
            if (series.SeriesId == -1) series.SeriesId = this._nextSeries++;

            let ce = <LiveChartsCore.ChartElement<TDrawingContext>><unknown>series;
            ce._isInternalSet = true;
            if (!ce._isThemeSet || isNewTheme) {
                theme.ApplyStyleToSeries(series);
                ce._isThemeSet = true;
            }

            let seriesBounds = series.GetBounds(this);

            this.ValueBounds.AppendValue(seriesBounds.PrimaryBounds.Max);
            this.ValueBounds.AppendValue(seriesBounds.PrimaryBounds.Min);
            this.IndexBounds.AppendValue(seriesBounds.SecondaryBounds.Max);
            this.IndexBounds.AppendValue(seriesBounds.SecondaryBounds.Min);
            this.PushoutBounds.AppendValue(seriesBounds.TertiaryBounds.Max);
            this.PushoutBounds.AppendValue(seriesBounds.TertiaryBounds.Min);

            ce._isInternalSet = false;
        }

        this.InitializeVisualsCollector();

        let seriesInLegend = this.Series.Where(x => x.IsVisibleAtLegend).ToArray();
        this.DrawLegend(seriesInLegend);

        let title = this.View.Title;
        let m = LiveChartsCore.Margin.Empty();
        let ts = 0;
        if (title != null) {
            let titleSize = title.Measure(this, null, null);
            m.Top = titleSize.Height;
            ts = titleSize.Height;
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

        for (const visual of this.VisualElements) this.AddVisual(visual);
        for (const series of this.Series) this.AddVisual(<LiveChartsCore.ChartElement<TDrawingContext>><unknown>series);

        this.CollectVisuals();

        this.InvokeOnUpdateStarted();
        this.IsFirstDraw = false;
        this.ThemeId = LiveChartsCore.LiveCharts.DefaultSettings.CurrentThemeId;
        this.PreviousSeriesAtLegend = this.Series.Where(x => x.IsVisibleAtLegend).ToArray();
        this.PreviousLegendPosition = this.LegendPosition;

        this.Canvas.Invalidate();
    }

    public Unload() {
        super.Unload();
        this.IsFirstDraw = true;
    }
}
