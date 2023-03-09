import * as LiveChartsCore from '@/LiveChartsCore'

export class NullableDoubleMotionProperty extends LiveChartsCore.MotionProperty<Nullable<number>> {
    // /// <summary>
    // /// Initializes a new instance of the <see cref="NullableDoubleMotionProperty"/> class.
    // /// </summary>
    // /// <param name="propertyName">Name of the property.</param>
    // public NullableDoubleMotionProperty(string propertyName)
    //     : base(propertyName)
    // {
    //     fromValue = 0;
    //     toValue = 0;
    // }

    public constructor(propertyName: string, value: Nullable<number>) {
        super(propertyName);
        this.fromValue = value;
        this.toValue = value;
    }

    protected OnGetMovement(progress: number): Nullable<number> {
        return this.fromValue == null || this.toValue == null ? this.toValue
            : this.fromValue + progress * (this.toValue - this.fromValue);
    }
}
