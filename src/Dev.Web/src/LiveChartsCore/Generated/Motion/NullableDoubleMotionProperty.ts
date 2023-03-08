import * as LiveChartsCore from '@/LiveChartsCore'

export class NullableDoubleMotionProperty extends LiveChartsCore.MotionProperty<Nullable<number>> {


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
