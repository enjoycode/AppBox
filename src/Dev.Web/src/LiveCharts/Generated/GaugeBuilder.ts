import * as PixUI from '@/PixUI'
import * as System from '@/System'
import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class GaugeBuilder implements LiveChartsCore.IGaugeBuilder<LiveCharts.SkiaDrawingContext> {
    private readonly _keyValuePairs: System.Dictionary<
        LiveChartsCore.ISeries,
        System.Tuple4<LiveChartsCore.ObservableValue, Nullable<string>, Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>, Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>>>
        = new System.Dictionary();
    private readonly _tuples: System.List<System.Tuple4<LiveChartsCore.ObservableValue, Nullable<string>, Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>, Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>>>
        = new System.List();

    private _builtSeries: Nullable<System.List<LiveCharts.PieSeries<LiveChartsCore.ObservableValue>>>;

    private _radialAlign: Nullable<LiveChartsCore.RadialAlignment> = null;
    private _innerRadius: Nullable<number> = null;
    private _offsetRadius: Nullable<number> = null;
    private _backgroundInnerRadius: Nullable<number> = null;
    private _backgroundOffsetRadius: Nullable<number> = null;
    private _backgroundCornerRadius: Nullable<number> = null;
    private _cornerRadius: Nullable<number> = null;
    private _background: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>> = null;
    private _labelsSize: Nullable<number> = null;
    private _labelsPosition: Nullable<LiveChartsCore.PolarLabelsPosition> = null;
    private _backgroundMaxRadialColumnWidth: Nullable<number> = null;
    private _maxColumnWidth: Nullable<number> = null;
    private _labelFormatter: System.Func2<LiveChartsCore.ChartPoint, string> = point => point.PrimaryValue.toString();

    public get InnerRadius(): Nullable<number> {
        return this._innerRadius;
    }

    public set InnerRadius(value: Nullable<number>) {
        this._innerRadius = value;
        this.OnPopertyChanged();
    }

    public WithInnerRadius(value: Nullable<number>): GaugeBuilder {
        this.InnerRadius = value;
        return this;
    }

    public get OffsetRadius(): Nullable<number> {
        return this._offsetRadius;
    }

    public set OffsetRadius(value: Nullable<number>) {
        this._offsetRadius = value;
        this.OnPopertyChanged();
    }

    public WithOffsetRadius(value: Nullable<number>): GaugeBuilder {
        this.OffsetRadius = value;
        return this;
    }

    public get MaxColumnWidth(): Nullable<number> {
        return this._maxColumnWidth;
    }

    public set MaxColumnWidth(value: Nullable<number>) {
        this._maxColumnWidth = value;
        this.OnPopertyChanged();
    }

    public WithMaxColumnWidth(value: Nullable<number>): GaugeBuilder {
        this.MaxColumnWidth = value;
        return this;
    }

    public get CornerRadius(): Nullable<number> {
        return this._cornerRadius;
    }

    public set CornerRadius(value: Nullable<number>) {
        this._cornerRadius = value;
        this.OnPopertyChanged();
    }

    public WithCornerRadius(value: Nullable<number>): GaugeBuilder {
        this.CornerRadius = value;
        return this;
    }

    public get RadialAlign(): Nullable<LiveChartsCore.RadialAlignment> {
        return this._radialAlign;
    }

    public set RadialAlign(value: Nullable<LiveChartsCore.RadialAlignment>) {
        this._radialAlign = value;
        this.OnPopertyChanged();
    }

    public WithRadialAlign(value: Nullable<LiveChartsCore.RadialAlignment>): GaugeBuilder {
        this.RadialAlign = value;
        return this;
    }

    public get BackgroundInnerRadius(): Nullable<number> {
        return this._backgroundInnerRadius;
    }

    public set BackgroundInnerRadius(value: Nullable<number>) {
        this._backgroundInnerRadius = value;
        this.OnPopertyChanged();
    }

    public WithBackgroundInnerRadius(value: Nullable<number>): GaugeBuilder {
        this.BackgroundInnerRadius = value;
        return this;
    }

    public get BackgroundOffsetRadius(): Nullable<number> {
        return this._backgroundOffsetRadius;
    }

    public set BackgroundOffsetRadius(value: Nullable<number>) {
        this._backgroundOffsetRadius = value;
        this.OnPopertyChanged();
    }

    public WithBackgroundOffsetRadius(value: Nullable<number>): GaugeBuilder {
        this.BackgroundOffsetRadius = value;
        return this;
    }

    public get BackgroundMaxRadialColumnWidth(): Nullable<number> {
        return this._backgroundMaxRadialColumnWidth;
    }

    public set BackgroundMaxRadialColumnWidth(value: Nullable<number>) {
        this._backgroundMaxRadialColumnWidth = value;
        this.OnPopertyChanged();
    }

    public WithBackgroundMaxRadialColumnWidth(value: Nullable<number>): GaugeBuilder {
        this.BackgroundMaxRadialColumnWidth = value;
        return this;
    }

    public get BackgroundCornerRadius(): Nullable<number> {
        return this._backgroundCornerRadius;
    }

    public set BackgroundCornerRadius(value: Nullable<number>) {
        this._backgroundCornerRadius = value;
        this.OnPopertyChanged();
    }

    public WithBackgroundCornerRadius(value: Nullable<number>): GaugeBuilder {
        this.BackgroundMaxRadialColumnWidth = value;
        return this;
    }

    public get Background(): Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>> {
        return this._background;
    }

    public set Background(value: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>) {
        this._background = value;
        this.OnPopertyChanged();
    }

    public WithBackground(value: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>): GaugeBuilder {
        this.Background = value;
        return this;
    }

    public get LabelsSize(): Nullable<number> {
        return this._labelsSize;
    }

    public set LabelsSize(value: Nullable<number>) {
        this._labelsSize = value;
        this.OnPopertyChanged();
    }

    public WithLabelsSize(value: number): GaugeBuilder {
        this.LabelsSize = value;
        return this;
    }

    public get LabelsPosition(): Nullable<LiveChartsCore.PolarLabelsPosition> {
        return this._labelsPosition;
    }

    public set LabelsPosition(value: Nullable<LiveChartsCore.PolarLabelsPosition>) {
        this._labelsPosition = value;
        this.OnPopertyChanged();
    }

    public WithLabelsPosition(value: LiveChartsCore.PolarLabelsPosition): GaugeBuilder {
        this.LabelsPosition = value;
        return this;
    }

    public get LabelFormatter(): System.Func2<LiveChartsCore.ChartPoint, string> {
        return this._labelFormatter;
    }

    public set LabelFormatter(value: System.Func2<LiveChartsCore.ChartPoint, string>) {
        this._labelFormatter = value;
        this.OnPopertyChanged();
    }

    public WithLabelFormatter(value: System.Func2<LiveChartsCore.ChartPoint, string>): GaugeBuilder {
        this.LabelFormatter = value;
        return this;
    }

    public AddValue1(value: LiveChartsCore.ObservableValue,
                     seriesName: Nullable<string>,
                     seriesPaint: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>,
                     labelsPaint: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>> = null): GaugeBuilder {
        this._tuples.Add(
            new System.Tuple4<LiveChartsCore.ObservableValue, Nullable<string>, Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>, Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>>(value, seriesName, seriesPaint, labelsPaint));

        return this;
    }

    public AddValue2(value: LiveChartsCore.ObservableValue, seriesName: string, seriesColor: PixUI.Color,
                     labelsColor: Nullable<PixUI.Color> = null): GaugeBuilder {
        labelsColor ??= new PixUI.Color(35, 35, 35);

        return this.AddValue1(value, seriesName, new LiveCharts.SolidColorPaint().Init({Color: seriesColor}),
            new LiveCharts.SolidColorPaint().Init({Color: labelsColor}));
    }

    public AddValue3(value: number, seriesName: string, seriesColor: PixUI.Color, labelsColor: Nullable<PixUI.Color> = null): GaugeBuilder {
        return this.AddValue2(new LiveChartsCore.ObservableValue(value), seriesName, seriesColor, labelsColor);
    }

    public AddValue4(value: LiveChartsCore.ObservableValue): GaugeBuilder {
        return this.AddValue1(value, null, null, null);
    }

    public AddValue5(value: number): GaugeBuilder {
        return this.AddValue4(new LiveChartsCore.ObservableValue(value));
    }

    public AddValue6(value: LiveChartsCore.ObservableValue, seriesName: Nullable<string>): GaugeBuilder {
        return this.AddValue1(value, seriesName, null, null);
    }

    public AddValue7(value: number, seriesName: Nullable<string>): GaugeBuilder {
        return this.AddValue6(new LiveChartsCore.ObservableValue(value), seriesName);
    }

    public BuildSeries(): System.List<LiveCharts.PieSeries<LiveChartsCore.ObservableValue>> {
        let series = new System.List<LiveCharts.PieSeries<LiveChartsCore.ObservableValue>>();

        let i = 0;
        for (const item of this._tuples) {
            let list = new System.List<LiveChartsCore.ObservableValue>();
            while (list.length < this._tuples.length - 1) {
                list.Add(new LiveChartsCore.ObservableValue(null));
            }

            list.Insert(i, item.Item1);

            let sf = new LiveCharts.PieSeries<LiveChartsCore.ObservableValue>(true).Init(
                {
                    ZIndex: i + 1,
                    Values: list,
                    Name: item.Item2,
                    HoverPushout: 0,
                    //DataLabelsPosition = PolarLabelsPosition.ChartCenter
                });

            if (item.Item3 != null) sf.Fill = item.Item3;
            if (item.Item4 != null) sf.DataLabelsPaint = item.Item4;
            if (this.LabelFormatter != null) sf.DataLabelsFormatter = this.LabelFormatter;

            let a = sf.Stroke;

            this.ApplyStyles(sf);
            series.Add(sf);
            this._keyValuePairs.Add(sf, item);

            i++;
        }

        let fillSeriesValues = new System.List<LiveChartsCore.ObservableValue>();
        while (fillSeriesValues.length < this._tuples.length) fillSeriesValues.Add(new LiveChartsCore.ObservableValue(0));

        let s = new LiveCharts.PieSeries<LiveChartsCore.ObservableValue>(true, true).Init(
            {
                ZIndex: -1,
                IsFillSeries: true,
                Values: fillSeriesValues
            });
        this.ApplyStyles(s);
        series.Add(s);

        this._builtSeries = series;

        return series;
    }

    public ApplyStyles(series: LiveCharts.PieSeries<LiveChartsCore.ObservableValue>) {
        if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.GaugeFill) == LiveChartsCore.SeriesProperties.GaugeFill) {
            this.ApplyStylesToFill(series);
            return;
        }

        this.ApplyStylesToSeries(series);
    }

    public ApplyStylesToFill(series: LiveCharts.PieSeries<LiveChartsCore.ObservableValue>) {
        if (this.Background != null) series.Fill = this.Background;
        if (this.BackgroundInnerRadius != null) series.InnerRadius = this.BackgroundInnerRadius;
        if (this.BackgroundOffsetRadius != null) {
            series.RelativeOuterRadius = this.BackgroundOffsetRadius;
            series.RelativeInnerRadius = this.BackgroundOffsetRadius;
        }

        if (this.BackgroundMaxRadialColumnWidth != null)
            series.MaxRadialColumnWidth = this.BackgroundMaxRadialColumnWidth;
        if (this.RadialAlign != null) series.RadialAlign = this.RadialAlign;
    }

    public ApplyStylesToSeries(series: LiveCharts.PieSeries<LiveChartsCore.ObservableValue>) {
        let t: any;
        if (this._keyValuePairs.TryGetValue(series, new System.Out(() => t, $v => t = $v)))
            if (t.Item3 != null)
                series.Fill = t.Item3;

        if (this.LabelsSize != null) series.DataLabelsSize = this.LabelsSize;
        if (this.LabelsPosition != null) series.DataLabelsPosition = this.LabelsPosition;
        if (this.InnerRadius != null) series.InnerRadius = this.InnerRadius;
        if (this.OffsetRadius != null) {
            series.RelativeInnerRadius = this.OffsetRadius;
            series.RelativeOuterRadius = this.OffsetRadius;
        }

        if (this.MaxColumnWidth != null) series.MaxRadialColumnWidth = this.MaxColumnWidth;
        if (this.RadialAlign != null) series.RadialAlign = this.RadialAlign;

        series.DataLabelsFormatter = this.LabelFormatter;
    }

    private OnPopertyChanged() {
        if (this._builtSeries == null) return;

        for (const item of this._builtSeries) {
            this.ApplyStyles(item);
        }
    }
}