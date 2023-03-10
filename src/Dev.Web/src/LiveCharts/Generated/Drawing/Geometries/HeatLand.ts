import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class HeatLand implements LiveChartsCore.IWeigthedMapLand {
    private _value: number = 0;

    // /// <summary>
    // /// Initializes a new instance of the <see cref="HeatLand"/> class.
    // /// </summary>
    // public HeatLand() { }

    // /// <summary>
    // /// Initializes a new instance of the <see cref="HeatLand"/> class.
    // /// </summary>
    // /// <param name="name">The name/</param>
    // /// <param name="value">The value.</param>
    // public HeatLand(string name, double value)
    // {
    //     Name = name;
    //     Value = value;
    // }

    public readonly PropertyChanged = new System.Event<any, System.PropertyChangedEventArgs>();

    public Name: string = '';

    public get Value(): number {
        return this._value;
    }

    public set Value(value: number) {
        this._value = value;
        this.OnPropertyChanged();
    }

    protected OnPropertyChanged(propertyName: Nullable<string> = null) {
        this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
    }

}
