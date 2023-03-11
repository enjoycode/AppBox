import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class ObservablePoint implements LiveChartsCore.IChartEntity, System.INotifyPropertyChanged {
    private static readonly $meta_LiveChartsCore_IChartEntity = true;
    private static readonly $meta_System_INotifyPropertyChanged = true;
    private _x: Nullable<number>;
    private _y: Nullable<number>;

    // /// <summary>
    // /// Initializes a new instance of the <see cref="ObservablePoint"/> class.
    // /// </summary>
    // public ObservablePoint()
    // { }

    public constructor(x: Nullable<number>, y: Nullable<number>) {
        this.X = x;
        this.Y = y;
    }

    public get X(): Nullable<number> {
        return this._x;
    }

    public set X(value: Nullable<number>) {
        this._x = value;
        this.OnPropertyChanged("X");
    }

    public get Y(): Nullable<number> {
        return this._y;
    }

    public set Y(value: Nullable<number>) {
        this._y = value;
        this.OnPropertyChanged("Y");
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
        this.Coordinate = this._x == null || this._y == null ? LiveChartsCore.Coordinate.Empty
            : LiveChartsCore.Coordinate.MakeByXY(this._x, this._y);
        this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
    }
}
