import * as LiveChartsCore from '@/LiveChartsCore'

export class ChartPoint {
    private _localCoordinate: LiveChartsCore.Coordinate = LiveChartsCore.Coordinate.Empty;

    protected IsLocalEmpty: boolean = false;

    public get IsLocalEmptyInternal(): boolean {
        return this.IsLocalEmpty;
    }

    public constructor(chart: LiveChartsCore.IChartView, series: LiveChartsCore.ISeries, entity: LiveChartsCore.IChartEntity) {
        this.Context = new LiveChartsCore.ChartPointContext(chart, series, entity);
    }


    public static get Empty(): ChartPoint {
        return new ChartPoint(null!, null!, new LiveChartsCore.MappedChartEntity()).Init({IsLocalEmpty: true});
    }

    public get IsEmpty(): boolean {
        return this.IsLocalEmpty || this.Context.Entity.Coordinate.IsEmpty;
    }

    public get PrimaryValue(): number {
        return this._localCoordinate.IsEmpty ? this.Context.Entity.Coordinate.PrimaryValue : this._localCoordinate.PrimaryValue;
    }

    public set PrimaryValue(value: number) {
        this.OnCoordinateChanged(
            new LiveChartsCore.Coordinate(value, this._localCoordinate.SecondaryValue, this._localCoordinate.TertiaryValue,
                this._localCoordinate.QuaternaryValue, this._localCoordinate.QuinaryValue));
    }

    public get SecondaryValue(): number {
        return this._localCoordinate.IsEmpty ? this.Context.Entity.Coordinate.SecondaryValue : this._localCoordinate.SecondaryValue;
    }

    public set SecondaryValue(value: number) {
        this.OnCoordinateChanged(
            new LiveChartsCore.Coordinate(this._localCoordinate.PrimaryValue, value, this._localCoordinate.TertiaryValue,
                this._localCoordinate.QuaternaryValue, this._localCoordinate.QuinaryValue));
    }

    public get TertiaryValue(): number {
        return this._localCoordinate.IsEmpty ? this.Context.Entity.Coordinate.TertiaryValue : this._localCoordinate.TertiaryValue;
    }

    public set TertiaryValue(value: number) {
        this.OnCoordinateChanged(
            new LiveChartsCore.Coordinate(this._localCoordinate.PrimaryValue, this._localCoordinate.SecondaryValue, value,
                this._localCoordinate.QuaternaryValue, this._localCoordinate.QuinaryValue));
    }

    public get QuaternaryValue(): number {
        return this._localCoordinate.IsEmpty ? this.Context.Entity.Coordinate.QuaternaryValue : this._localCoordinate.QuaternaryValue;
    }

    public set QuaternaryValue(value: number) {
        this.OnCoordinateChanged(
            new LiveChartsCore.Coordinate(this._localCoordinate.PrimaryValue, this._localCoordinate.SecondaryValue,
                this._localCoordinate.TertiaryValue, value, this._localCoordinate.QuinaryValue));
    }

    public get QuinaryValue(): number {
        return this._localCoordinate.IsEmpty ? this.Context.Entity.Coordinate.QuinaryValue : this._localCoordinate.QuinaryValue;
    }

    public set QuinaryValue(value: number) {
        this.OnCoordinateChanged(
            new LiveChartsCore.Coordinate(this._localCoordinate.PrimaryValue, this._localCoordinate.SecondaryValue,
                this._localCoordinate.TertiaryValue, this._localCoordinate.QuaternaryValue, value));
    }

    public StackedValue: Nullable<LiveChartsCore.StackedValue>;

    public get AsTooltipString(): string {
        return this.Context.Series.GetTooltipText(this);
    }

    public get AsDataLabel(): string {
        return this.Context.Series.GetDataLabelText(this);
    }

    #Context: LiveChartsCore.ChartPointContext;
    public get Context() {
        return this.#Context;
    }

    private set Context(value) {
        this.#Context = value;
    }

    public RemoveOnCompleted: boolean = false;

    public DistanceTo(point: LiveChartsCore.LvcPoint): number {
        return this.Context.HoverArea?.DistanceTo((point).Clone()) ?? NaN;
    }

    private OnCoordinateChanged(coordinate: LiveChartsCore.Coordinate) {


        this._localCoordinate = coordinate;
    }
}

export class ChartPoint3<TModel, TVisual, TLabel> extends ChartPoint {
    public constructor(point: ChartPoint) {
        super(point.Context.Chart, point.Context.Series, point.Context.Entity);
        this.IsLocalEmpty = point.IsLocalEmptyInternal;

        this.StackedValue = point.StackedValue;
        this.Context.DataSource = point.Context.DataSource;
        this.Context.Visual = point.Context.Visual;
        this.Context.Label = point.Context.Label;
        this.Context.HoverArea = point.Context.HoverArea;
    }

    public get Model(): Nullable<TModel> {
        return <Nullable<TModel>><unknown>this.Context.DataSource;
    }

    public get Visual(): Nullable<TVisual> {
        return <Nullable<TVisual>><unknown>this.Context.Visual;
    }

    public get Label(): Nullable<TLabel> {
        return <Nullable<TLabel>><unknown>this.Context.Label;
    }
}
