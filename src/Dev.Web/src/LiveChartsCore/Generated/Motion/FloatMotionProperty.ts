import * as LiveChartsCore from '@/LiveChartsCore'

export class FloatMotionProperty extends LiveChartsCore.MotionProperty<number> {
    // /// <summary>
    // /// Initializes a new instance of the <see cref="FloatMotionProperty"/> class.
    // /// </summary>
    // /// <param name="propertyName">Name of the property.</param>
    // public FloatMotionProperty(string propertyName)
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

    OnGetMovement(progress: number): number {
        return this.fromValue + progress * (this.toValue - this.fromValue);
    }
}
