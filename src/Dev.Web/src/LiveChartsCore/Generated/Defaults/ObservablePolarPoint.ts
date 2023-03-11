import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class ObservablePolarPoint implements LiveChartsCore.IChartEntity, System.INotifyPropertyChanged {
    private static readonly $meta_LiveChartsCore_IChartEntity = true;
    private static readonly $meta_System_INotifyPropertyChanged = true;
    private _angle: Nullable<number>;
    private _radius: Nullable<number>;

    // /// <summary>
    // /// Initializes a new instance of the <see cref="ObservablePoint"/> class.
    // /// </summary>
    // public ObservablePolarPoint()
    // { }

    public constructor(angle: Nullable<number>, radius: Nullable<number>) {
        this.Angle = angle;
        this.Radius = radius;
    }

    public get Angle(): Nullable<number> {
        return this._angle;
    }

    public set Angle(value: Nullable<number>) {
        this._angle = value;
        this.OnPropertyChanged("Angle");
    }

    public get Radius(): Nullable<number> {
        return this._radius;
    }

    public set Radius(value: Nullable<number>) {
        this._radius = value;
        this.OnPropertyChanged("Radius");
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
        this.Coordinate = this._radius == null || this._angle == null ? LiveChartsCore.Coordinate.Empty
            : LiveChartsCore.Coordinate.MakeByXY(this._angle, this._radius);
        this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
    }
}
