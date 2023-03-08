import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class FinancialPoint implements LiveChartsCore.IChartEntity, System.INotifyPropertyChanged {
    private static readonly $meta_LiveChartsCore_IChartEntity = true;
    private static readonly $meta_System_INotifyPropertyChanged = true;
    private _high: Nullable<number>;
    private _open: Nullable<number>;
    private _close: Nullable<number>;
    private _low: Nullable<number>;
    private _date: System.DateTime = System.DateTime.Empty.Clone();


    public constructor(date: System.DateTime, high: Nullable<number>, open: Nullable<number>, close: Nullable<number>, low: Nullable<number>) {
        this.Date = date;
        this.High = high;
        this.Open = open;
        this.Close = close;
        this.Low = low;
    }

    public get Date(): System.DateTime {
        return this._date;
    }

    public set Date(value: System.DateTime) {
        this._date = value;
        this.OnPropertyChanged();
    }

    public get High(): Nullable<number> {
        return this._high;
    }

    public set High(value: Nullable<number>) {
        this._high = value;
        this.OnPropertyChanged();
    }

    public get Open(): Nullable<number> {
        return this._open;
    }

    public set Open(value: Nullable<number>) {
        this._open = value;
        this.OnPropertyChanged();
    }

    public get Close(): Nullable<number> {
        return this._close;
    }

    public set Close(value: Nullable<number>) {
        this._close = value;
        this.OnPropertyChanged();
    }

    public get Low(): Nullable<number> {
        return this._low;
    }

    public set Low(value: Nullable<number>) {
        this._low = value;
        this.OnPropertyChanged();
    }

    public EntityIndex: number = 0;

    public ChartPoints: Nullable<System.ObjectMap<LiveChartsCore.ChartPoint>>;

    #Coordinate: LiveChartsCore.Coordinate = LiveChartsCore.Coordinate.Empty;
    public get Coordinate() {
        return this.#Coordinate;
    }

    private set Coordinate(value) {
        this.#Coordinate = value;
    }

    public readonly PropertyChanged = new System.Event<any, System.PropertyChangedEventArgs>();

    protected OnPropertyChanged(propertyName: Nullable<string> = null) {
        this.Coordinate = this._open == null || this._high == null || this._low == null || this._close == null ? LiveChartsCore.Coordinate.Empty
            : new LiveChartsCore.Coordinate(this._high, Number(this._date.Ticks), this._open, this._close, this._low);
        this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
    }
}
