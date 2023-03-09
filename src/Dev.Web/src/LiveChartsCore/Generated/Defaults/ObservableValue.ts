import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class ObservableValue implements LiveChartsCore.IChartEntity, System.INotifyPropertyChanged {
    private static readonly $meta_LiveChartsCore_IChartEntity = true;
    private static readonly $meta_System_INotifyPropertyChanged = true;
    private _value: Nullable<number>;
    private _entityIndex: number = 0;

    // /// <summary>
    // /// Initializes a new instance of the <see cref="ObservableValue"/> class.
    // /// </summary>
    // public ObservableValue()
    // { }

    public constructor(value: Nullable<number>) {
        this.Value = value;
    }

    public get Value(): Nullable<number> {
        return this._value;
    }

    public set Value(value: Nullable<number>) {
        this._value = value;
        this.OnPropertyChanged();
    }

    public get EntityIndex(): number {
        return this._entityIndex;
    }

    public set EntityIndex(value: number) {
        // the coordinate of this type depends on the index of element in the data collection.
        // we update the coordinate if the index changed.
        if (value == this._entityIndex) return;
        this._entityIndex = value;
        this.OnCoordinateChanged();
    }

    public ChartPoints: Nullable<System.Dictionary<LiveChartsCore.IChartView, LiveChartsCore.ChartPoint>>;

    #Coordinate: LiveChartsCore.Coordinate = LiveChartsCore.Coordinate.Empty;
    public get Coordinate() {
        return this.#Coordinate;
    }

    private set Coordinate(value) {
        this.#Coordinate = value;
    }

    public readonly PropertyChanged = new System.Event<any, System.PropertyChangedEventArgs>();

    protected OnPropertyChanged(propertyName: Nullable<string> = null) {
        this.OnCoordinateChanged();
        this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
    }

    protected OnCoordinateChanged() {
        this.Coordinate = this._value == null ? LiveChartsCore.Coordinate.Empty
            : LiveChartsCore.Coordinate.MakeByXY(this.EntityIndex, this._value);
    }
}
