import * as LiveChartsCore from '@/LiveChartsCore'

export class PointMotionProperty extends LiveChartsCore.MotionProperty<LiveChartsCore.LvcPoint> {


    public constructor(propertyName: string, value: LiveChartsCore.LvcPoint) {
        super(propertyName);
        this.fromValue = (value).Clone();
        this.toValue = (value).Clone();
    }

    protected OnGetMovement(progress: number): LiveChartsCore.LvcPoint {
        return new LiveChartsCore.LvcPoint(this.fromValue.X + progress * (this.toValue.X - this.fromValue.X),
            this.fromValue.Y + progress * (this.toValue.Y - this.fromValue.Y));
    }
}
