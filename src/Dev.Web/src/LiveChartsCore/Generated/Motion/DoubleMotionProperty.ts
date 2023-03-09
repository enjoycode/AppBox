import * as LiveChartsCore from '@/LiveChartsCore'

export class DoubleMotionProperty extends LiveChartsCore.MotionProperty<number> {
    // /// <summary>
    // /// Initializes a new instance of the <see cref="DoubleMotionProperty"/> class.
    // /// </summary>
    // /// <param name="propertyName">Name of the property.</param>
    // public DoubleMotionProperty(string propertyName)
    //     : base(propertyName)
    // {
    //     fromValue = 0;
    //     toValue = 0;
    // }

    public constructor(propertyName: string, value: number = 0) {
        super(propertyName);
        this.fromValue = value;
        this.toValue = value;
    }

    protected OnGetMovement(progress: number): number {
        return this.fromValue + progress * (this.toValue - this.fromValue);
    }
}
