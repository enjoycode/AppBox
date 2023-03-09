import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class TimeSpanPoint implements LiveChartsCore.IChartEntity, System.INotifyPropertyChanged {
    private static readonly $meta_LiveChartsCore_IChartEntity = true;
    private static readonly $meta_System_INotifyPropertyChanged = true;
    private _timeSpan: System.TimeSpan = System.TimeSpan.Empty.Clone();
    private _value: Nullable<number>;

    // /// <summary>
    // /// Initializes a new instance of the <see cref="TimeSpanPoint"/> class.
    // /// </summary>
    // public TimeSpanPoint()
    // { }

    public constructor(timeSpan: System.TimeSpan, value: Nullable<number>) {
        this.TimeSpan = timeSpan;
        this.Value = value;
    }

    public get TimeSpan(): System.TimeSpan {
        return this._timeSpan;
    }

    public set TimeSpan(value: System.TimeSpan) {
        this._timeSpan = value;
        this.OnPropertyChanged();
    }

    public get Value(): Nullable<number> {
        return this._value;
    }

    public set Value(value: Nullable<number>) {
        this._value = value;
        this.OnPropertyChanged();
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
        this.Coordinate = this._value == null ? LiveChartsCore.Coordinate.Empty
            : LiveChartsCore.Coordinate.MakeByXY(Number(this._timeSpan.Ticks), this._value ?? 0);
        this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
    }
}
