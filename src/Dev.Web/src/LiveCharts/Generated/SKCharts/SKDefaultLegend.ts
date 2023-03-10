import * as PixUI from '@/PixUI'
import * as System from '@/System'
import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class SKDefaultLegend implements LiveChartsCore.IChartLegend<LiveCharts.SkiaDrawingContext>, LiveChartsCore.IImageControl {
    private static readonly $meta_LiveChartsCore_IImageControl = true;
    private static readonly s_zIndex: number = 10050;
    private _orientation: LiveChartsCore.ContainerOrientation = LiveChartsCore.ContainerOrientation.Vertical;
    private _stackPanel: Nullable<LiveChartsCore.StackPanel<LiveCharts.RoundedRectangleGeometry, LiveCharts.SkiaDrawingContext>>;

    private readonly _activeSeries: LiveCharts.DoubleDict<LiveChartsCore.IChartSeries<LiveCharts.SkiaDrawingContext>, LiveChartsCore.VisualElement<LiveCharts.SkiaDrawingContext>> = new LiveCharts.DoubleDict();

    private _toRemoveSeries: System.List<LiveChartsCore.VisualElement<LiveCharts.SkiaDrawingContext>> = new System.List();
    private _backgroundPaint: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>;

    public constructor() {
        this.FontPaint = new LiveCharts.SolidColorPaint().Init({Color: new PixUI.Color(30, 30, 30, 255)});
    }

    public Size: LiveChartsCore.LvcSize = LiveChartsCore.LvcSize.Empty.Clone();

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

    public TextSize: number = 15;

    Draw(chart: LiveChartsCore.Chart<LiveCharts.SkiaDrawingContext>) {
        if (chart.Legend == null || chart.LegendPosition == LiveChartsCore.LegendPosition.Hidden) return;

        this.Measure(chart);

        if (this._stackPanel == null) return;
        if (this.BackgroundPaint != null) this.BackgroundPaint.ZIndex = SKDefaultLegend.s_zIndex;
        if (this.FontPaint != null) this.FontPaint.ZIndex = SKDefaultLegend.s_zIndex + 1;

        let actualChartSize = (chart.ControlSize).Clone();

        // this seems a constant layout issue...
        // ToDo:
        // this is a workaround to force the legend to be drawn in the correct position
        // It seems that this value is constant, it seems to not be affected by the font size or the stack panel properties.
        // is this and SkiaSharp measure issue?
        // is it a LiveCharts issue?
        let iDontKnowWhyThis = 17;

        if (chart.LegendPosition == LiveChartsCore.LegendPosition.Top) {
            chart.Canvas.StartPoint = new LiveChartsCore.LvcPoint(0, this.Size.Height);
            this._stackPanel.X = actualChartSize.Width * 0.5 - this.Size.Width * 0.5;
            this._stackPanel.Y = -this.Size.Height;
        }

        if (chart.LegendPosition == LiveChartsCore.LegendPosition.Bottom) {
            this._stackPanel.X = actualChartSize.Width * 0.5 - this.Size.Width * 0.5;
            this._stackPanel.Y = actualChartSize.Height;
        }

        if (chart.LegendPosition == LiveChartsCore.LegendPosition.Left) {
            chart.Canvas.StartPoint = new LiveChartsCore.LvcPoint(this.Size.Width, 0);
            this._stackPanel.X = -this.Size.Width;
            this._stackPanel.Y = actualChartSize.Height * 0.5 - this.Size.Height * 0.5;
        }

        if (chart.LegendPosition == LiveChartsCore.LegendPosition.Right) {
            this._stackPanel.X = actualChartSize.Width - iDontKnowWhyThis;
            this._stackPanel.Y = actualChartSize.Height * 0.5 - this.Size.Height * 0.5;
        }

        chart.AddVisual(this._stackPanel);

        for (const visual of this._toRemoveSeries) {
            let series: any;
            this._stackPanel.Children.Remove(visual);
            chart.RemoveVisual(visual);
            if (this._activeSeries.TryGetKey(visual, new System.Out(() => series, $v => series = $v))) this._activeSeries.Remove(series);
        }
    }

    private BuildLayout(chart: LiveChartsCore.Chart<LiveCharts.SkiaDrawingContext>) {
        if (chart.View.LegendBackgroundPaint != null) this.BackgroundPaint = chart.View.LegendBackgroundPaint;
        if (chart.View.LegendTextPaint != null) this.FontPaint = chart.View.LegendTextPaint;
        if (chart.View.LegendTextSize != null) this.TextSize = chart.View.LegendTextSize;

        this._orientation = chart.LegendPosition == LiveChartsCore.LegendPosition.Left || chart.LegendPosition == LiveChartsCore.LegendPosition.Right
            ? LiveChartsCore.ContainerOrientation.Vertical
            : LiveChartsCore.ContainerOrientation.Horizontal;

        this._stackPanel ??=
            new LiveChartsCore.StackPanel<LiveCharts.RoundedRectangleGeometry, LiveCharts.SkiaDrawingContext>(() => new LiveCharts.RoundedRectangleGeometry()).Init(
                {
                    Padding: LiveChartsCore.Padding.All(0),
                    HorizontalAlignment: LiveChartsCore.Align.Start,
                    VerticalAlignment: LiveChartsCore.Align.Middle,
                });

        this._stackPanel.Orientation = this._orientation;
        this._stackPanel.BackgroundPaint = this.BackgroundPaint;

        this._toRemoveSeries = new System.List<LiveChartsCore.VisualElement<LiveCharts.SkiaDrawingContext>>(this._stackPanel.Children);

        for (const series of chart.ChartSeries) {
            if (!series.IsVisibleAtLegend) continue;

            let seriesMiniatureVisual = this.GetSeriesVisual(series);
            this._toRemoveSeries.Remove(seriesMiniatureVisual);
        }
    }

    public Measure(chart: LiveChartsCore.IChart) {
        let skiaChart = <LiveChartsCore.Chart<LiveCharts.SkiaDrawingContext>><unknown>chart;
        this.BuildLayout(skiaChart);
        if (this._stackPanel == null) return;
        this.Size = this._stackPanel.Measure(skiaChart, null, null);
    }

    private GetSeriesVisual(series: LiveChartsCore.IChartSeries<LiveCharts.SkiaDrawingContext>): LiveChartsCore.VisualElement<LiveCharts.SkiaDrawingContext> {
        let seriesPanel: any;
        if (this._activeSeries.TryGetValue(series, new System.Out(() => seriesPanel, $v => seriesPanel = $v))) return seriesPanel;

        let sketch = series.GetMiniatresSketch();
        let relativePanel = LiveCharts.VisualElementsExtensions.AsDrawnControl(sketch,);

        let sp = new LiveChartsCore.StackPanel<LiveCharts.RoundedRectangleGeometry, LiveCharts.SkiaDrawingContext>(() => new LiveCharts.RoundedRectangleGeometry()).Init(
            {
                Padding: new LiveChartsCore.Padding(15, 4, 15, 4),
                VerticalAlignment: LiveChartsCore.Align.Middle,
                HorizontalAlignment: LiveChartsCore.Align.Middle,
            });
        sp.Children.Add(relativePanel);
        sp.Children.Add(new LiveCharts.LabelVisual().Init(
            {
                Text: series.Name ?? '',
                Paint: this.FontPaint,
                TextSize: this.TextSize,
                Padding: new LiveChartsCore.Padding(8, 0, 0, 0),
                VerticalAlignment: LiveChartsCore.Align.Start,
                HorizontalAlignment: LiveChartsCore.Align.Start
            }));
        this._stackPanel?.Children.Add(sp);
        this._activeSeries.Add(series, sp);

        return sp;
    }
}