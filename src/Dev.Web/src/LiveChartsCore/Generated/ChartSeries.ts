import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class ChartSeries<TModel, TVisual extends object & LiveChartsCore.IVisualChartPoint<TDrawingContext>, TLabel extends object & LiveChartsCore.ILabelGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.Series<TModel, TVisual, TLabel, TDrawingContext> implements LiveChartsCore.IChartSeries<TDrawingContext> {
    private _dataLabelsPaint: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _dataLabelsSize: number = 16;
    private _dataLabelsRotation: number = 0;
    private _dataLabelsPadding: LiveChartsCore.Padding = new LiveChartsCore.Padding(6, 8, 6, 8);

    protected constructor(properties: LiveChartsCore.SeriesProperties) {
        super(properties);
    }

    public get DataLabelsPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._dataLabelsPaint;
    }

    public set DataLabelsPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._dataLabelsPaint, $v => this._dataLabelsPaint = $v), value);
    }

    public get DataLabelsSize(): number {
        return this._dataLabelsSize;
    }

    public set DataLabelsSize(value: number) {
        this.SetProperty(new System.Ref(() => this._dataLabelsSize, $v => this._dataLabelsSize = $v), value);
    }

    public get DataLabelsRotation(): number {
        return this._dataLabelsRotation;
    }

    public set DataLabelsRotation(value: number) {
        this.SetProperty(new System.Ref(() => this._dataLabelsRotation, $v => this._dataLabelsRotation = $v), value);
    }

    public get DataLabelsPadding(): LiveChartsCore.Padding {
        return this._dataLabelsPadding;
    }

    public set DataLabelsPadding(value: LiveChartsCore.Padding) {
        this.SetProperty(new System.Ref(() => this._dataLabelsPadding, $v => this._dataLabelsPadding = $v), value);
    }

    #IsFirstDraw: boolean = true;
    public get IsFirstDraw() {
        return this.#IsFirstDraw;
    }

    protected set IsFirstDraw(value) {
        this.#IsFirstDraw = value;
    }

    public abstract MiniatureEquals(instance: LiveChartsCore.IChartSeries<TDrawingContext>): boolean;

    OnDataPointerDown(chart: LiveChartsCore.IChartView, points: System.IEnumerable<LiveChartsCore.ChartPoint>, pointer: LiveChartsCore.LvcPoint) {
        this.OnDataPointerDown(chart, points, (pointer).Clone());
    }
}
