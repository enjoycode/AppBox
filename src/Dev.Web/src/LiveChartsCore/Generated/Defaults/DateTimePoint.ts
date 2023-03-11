import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class DateTimePoint implements LiveChartsCore.IChartEntity, System.INotifyPropertyChanged {
    private static readonly $meta_LiveChartsCore_IChartEntity = true;
    private static readonly $meta_System_INotifyPropertyChanged = true;
    private _dateTime: System.DateTime = System.DateTime.Empty.Clone();
    private _value: Nullable<number>;

    // /// <summary>
    // /// Initializes a new instance of the <see cref="DateTimePoint"/> class.
    // /// </summary>
    // public DateTimePoint()
    // { }

    public constructor(dateTime: System.DateTime, value: Nullable<number>) {
        this.DateTime = dateTime;
        this.Value = value;
        this.Coordinate = value == null ? LiveChartsCore.Coordinate.Empty : LiveChartsCore.Coordinate.MakeByXY(Number(dateTime.Ticks), value);
    }

    public get DateTime(): System.DateTime {
        return this._dateTime;
    }

    public set DateTime(value: System.DateTime) {
        this._dateTime = value;
        this.OnPropertyChanged("DateTime");
    }

    public get Value(): Nullable<number> {
        return this._value;
    }

    public set Value(value: Nullable<number>) {
        this._value = value;
        this.OnPropertyChanged("Value");
    }

    public EntityIndex: number = 0;

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
        this.Coordinate = this._value == null ? LiveChartsCore.Coordinate.Empty : LiveChartsCore.Coordinate.MakeByXY(Number(this._dateTime.Ticks), this._value);
        this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
    }
}
