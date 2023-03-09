import * as LiveChartsCore from '@/LiveChartsCore'

export class ChartPointContext {
    public constructor(chart: LiveChartsCore.IChartView, series: LiveChartsCore.ISeries, entity: LiveChartsCore.IChartEntity) {
        this.Chart = chart;
        this.Series = series;
        this.Entity = entity;
    }

    //internal static ChartPointContext MakeDefault() => new (null!, null!, new MappedChartEntity());

    // internal ChartPointContext()
    // {
    //     // dummy empty constructor..
    //     // This is used only when the IChartEntity was null
    //     Chart = null!;
    //     Series = null!;
    //     Entity = new MappedChartEntity();
    // }

    #Chart: LiveChartsCore.IChartView;
    public get Chart() {
        return this.#Chart;
    }

    private set Chart(value) {
        this.#Chart = value;
    }

    #Series: LiveChartsCore.ISeries;
    public get Series() {
        return this.#Series;
    }

    private set Series(value) {
        this.#Series = value;
    }

    #Entity: LiveChartsCore.IChartEntity;
    public get Entity() {
        return this.#Entity;
    }

    private set Entity(value) {
        this.#Entity = value;
    }

    #DataSource: any;
    public get DataSource() {
        return this.#DataSource;
    }

    public set DataSource(value) {
        this.#DataSource = value;
    }

    public get Index(): number {
        return this.Entity?.EntityIndex ?? 0;
    }

    #Visual: any;
    public get Visual() {
        return this.#Visual;
    }

    public set Visual(value) {
        this.#Visual = value;
    }

    #Label: any;
    public get Label() {
        return this.#Label;
    }

    public set Label(value) {
        this.#Label = value;
    }

    #HoverArea: Nullable<LiveChartsCore.HoverArea>;
    public get HoverArea() {
        return this.#HoverArea;
    }

    public set HoverArea(value) {
        this.#HoverArea = value;
    }
}
