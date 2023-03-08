import * as LiveChartsCore from '@/LiveChartsCore'

export class FloatMotionProperty extends LiveChartsCore.MotionProperty<number> {


    public constructor(propertyName: string, value: number = 0) {
        super(propertyName);
        this.fromValue = value;
        this.toValue = value;
    }

    protected OnGetMovement(progress: number): number {
        return this.fromValue + progress * (this.toValue - this.fromValue);
    }
}
