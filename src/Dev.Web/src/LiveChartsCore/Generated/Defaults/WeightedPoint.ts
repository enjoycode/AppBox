import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class WeightedPoint implements LiveChartsCore.IChartEntity, System.INotifyPropertyChanged {
    private static readonly $meta_LiveChartsCore_IChartEntity = true;
    private static readonly $meta_System_INotifyPropertyChanged = true;
    private _x: Nullable<number>;
    private _y: Nullable<number>;
    private _weight: Nullable<number>;

    // /// <summary>
    // /// Initializes a new instance of the <see cref="WeightedPoint"/> class.
    // /// </summary>
    // public WeightedPoint()
    // { }

    public constructor(x: Nullable<number>, y: Nullable<number>, weight: Nullable<number>) {
        this.X = x;
        this.Y = y;
        this.Weight = weight;
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

    public get Weight(): Nullable<number> {
        return this._weight;
    }

    public set Weight(value: Nullable<number>) {
        this._weight = value;
        this.OnPropertyChanged("Weight");
    }

    public readonly PropertyChanged = new System.Event<any, System.PropertyChangedEventArgs>();

    public EntityIndex: number = 0;

    public ChartPoints: Nullable<System.Dictionary<LiveChartsCore.IChartView, LiveChartsCore.ChartPoint>>;

    #Coordinate: LiveChartsCore.Coordinate = LiveChartsCore.Coordinate.Empty;
    public get Coordinate() {
        return this.#Coordinate;
    }

    private set Coordinate(value) {
        this.#Coordinate = value;
    }

    protected OnPropertyChanged(propertyName: Nullable<string> = null) {
        this.Coordinate = this._x == null || this._y == null ? LiveChartsCore.Coordinate.Empty
            : LiveChartsCore.Coordinate.MakeByXY(this._x ?? 0, this._y ?? 0, this._weight ?? 0);
        this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
    }
}
