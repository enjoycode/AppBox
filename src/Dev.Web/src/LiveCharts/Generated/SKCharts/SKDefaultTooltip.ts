import * as PixUI from '@/PixUI'
import * as System from '@/System'
import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class SKDefaultTooltip implements LiveChartsCore.IChartTooltip<LiveCharts.SkiaDrawingContext>, LiveChartsCore.IImageControl {
    private static readonly $meta_LiveChartsCore_IImageControl = true;
    private static readonly s_zIndex: number = 10050;
    private _chart: Nullable<LiveChartsCore.Chart<LiveCharts.SkiaDrawingContext>>;
    private _backgroundPaint: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>;
    private _stackPanel: Nullable<LiveChartsCore.StackPanel<LiveCharts.RoundedRectangleGeometry, LiveCharts.SkiaDrawingContext>>;
    private readonly _seriesVisualsMap: System.Dictionary<LiveChartsCore.ISeries, SeriesVisual> = new System.Dictionary();

    public constructor() {
        this.FontPaint = new LiveCharts.SolidColorPaint().Init({Color: new PixUI.Color(28, 49, 58)});
        this.BackgroundPaint = new LiveCharts.SolidColorPaint().Init(
            {
                Color: new PixUI.Color(240, 240, 240),
                ImageFilter: new LiveCharts.DropShadow(2, 2, 2, 2, new PixUI.Color(30, 30, 30, 60))
            });
    }

    #Size: LiveChartsCore.LvcSize = LiveChartsCore.LvcSize.Empty.Clone();
    public get Size() {
        return this.#Size;
    }

    private set Size(value) {
        this.#Size = value;
    }

    public FontPaint: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>;

    public get BackgroundPaint(): Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>> {
        return this._backgroundPaint;
    }

    public set BackgroundPaint(value: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>) {
        this._backgroundPaint = value;
        if (value != null) {
            value.IsFill = true;
        }
    }

    public TextSize: number = 16;

    public Show(foundPoints: System.IEnumerable<LiveChartsCore.ChartPoint>, chart: LiveChartsCore.Chart<LiveCharts.SkiaDrawingContext>) {
        this._chart = chart;

        if (chart.View.TooltipBackgroundPaint != null) this.BackgroundPaint = chart.View.TooltipBackgroundPaint;
        if (chart.View.TooltipTextPaint != null) this.FontPaint = chart.View.TooltipTextPaint;
        if (chart.View.TooltipTextSize != null) this.TextSize = chart.View.TooltipTextSize;

        if (this.BackgroundPaint != null) this.BackgroundPaint.ZIndex = SKDefaultTooltip.s_zIndex;
        if (this.FontPaint != null) this.FontPaint.ZIndex = SKDefaultTooltip.s_zIndex + 1;

        let sp = this._stackPanel ??=
            new LiveChartsCore.StackPanel<LiveCharts.RoundedRectangleGeometry, LiveCharts.SkiaDrawingContext>(() => new LiveCharts.RoundedRectangleGeometry()).Init(
                {
                    Padding: new LiveChartsCore.Padding(12, 8, 12, 8),
                    Orientation: LiveChartsCore.ContainerOrientation.Vertical,
                    HorizontalAlignment: LiveChartsCore.Align.Start,
                    VerticalAlignment: LiveChartsCore.Align.Middle,
                    BackgroundPaint: this.BackgroundPaint
                });

        let toRemoveSeries = new System.List<SeriesVisual>(this._seriesVisualsMap.Values);
        for (const point of foundPoints) {
            let seriesMiniatureVisual = this.GetSeriesVisual(point);
            toRemoveSeries.Remove(seriesMiniatureVisual);
        }

        this.Measure(chart);

        let location = LiveChartsCore.Extensions.GetTooltipLocation(foundPoints, (this.Size).Clone(), chart);

        this._stackPanel.X = location.X;
        this._stackPanel.Y = location.Y;

        for (const seriesVisual of toRemoveSeries) {
            this._stackPanel.Children.Remove(seriesVisual.Visual);
            chart.RemoveVisual(seriesVisual.Visual);
            this._seriesVisualsMap.Remove(seriesVisual.Series);
        }

        chart.AddVisual(sp);
    }

    public Hide() {
        if (this._chart == null || this._stackPanel == null) return;
        this._chart.RemoveVisual(this._stackPanel);
    }

    public Measure(chart: LiveChartsCore.IChart) {
        if (this._stackPanel == null) return;
        this.Size = this._stackPanel.Measure(<LiveChartsCore.Chart<LiveCharts.SkiaDrawingContext>><unknown>chart, null, null);
    }

    private GetSeriesVisual(point: LiveChartsCore.ChartPoint): SeriesVisual {
        let visual: any;
        if (this._seriesVisualsMap.TryGetValue(point.Context.Series, new System.Out(() => visual, $v => visual = $v))) {
            if (this._chart == null) return visual;
            visual.LabelVisual.Text = point.AsTooltipString;
            visual.LabelVisual.Invalidate(this._chart);
            return visual;
        }

        let sketch = (<LiveChartsCore.IChartSeries<LiveCharts.SkiaDrawingContext>><unknown>point.Context.Series).GetMiniatresSketch();
        let relativePanel = LiveCharts.VisualElementsExtensions.AsDrawnControl(sketch,);

        let label = new LiveCharts.LabelVisual().Init(
            {
                Text: point.AsTooltipString,
                Paint: this.FontPaint,
                TextSize: this.TextSize,
                Padding: new LiveChartsCore.Padding(8, 0, 0, 0),
                VerticalAlignment: LiveChartsCore.Align.Start,
                HorizontalAlignment: LiveChartsCore.Align.Start
            });

        let sp = new LiveChartsCore.StackPanel<LiveCharts.RoundedRectangleGeometry, LiveCharts.SkiaDrawingContext>(() => new LiveCharts.RoundedRectangleGeometry()).Init(
            {
                Padding: new LiveChartsCore.Padding(0, 4, 0, 4),
                VerticalAlignment: LiveChartsCore.Align.Middle,
                HorizontalAlignment: LiveChartsCore.Align.Middle,
            });
        sp.Children.Add(relativePanel);
        sp.Children.Add(label);
        this._stackPanel?.Children.Add(sp);
        let seriesVisual = new SeriesVisual(point.Context.Series, sp, label);
        this._seriesVisualsMap.Add(point.Context.Series, seriesVisual);

        return seriesVisual;
    }
}

export class SeriesVisual {
    public constructor(
        series: LiveChartsCore.ISeries,
        stackPanel: LiveChartsCore.StackPanel<LiveCharts.RoundedRectangleGeometry, LiveCharts.SkiaDrawingContext>,
        label: LiveCharts.LabelVisual) {
        this.Series = series;
        this.Visual = stackPanel;
        this.LabelVisual = label;
    }

    #Series: LiveChartsCore.ISeries;
    public get Series() {
        return this.#Series;
    }

    private set Series(value) {
        this.#Series = value;
    }

    #Visual: LiveChartsCore.StackPanel<LiveCharts.RoundedRectangleGeometry, LiveCharts.SkiaDrawingContext>;
    public get Visual() {
        return this.#Visual;
    }

    private set Visual(value) {
        this.#Visual = value;
    }

    public LabelVisual: LiveCharts.LabelVisual;
}