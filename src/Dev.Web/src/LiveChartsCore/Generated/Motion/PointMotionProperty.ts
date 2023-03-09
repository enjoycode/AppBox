import * as LiveChartsCore from '@/LiveChartsCore'

export class PointMotionProperty extends LiveChartsCore.MotionProperty<LiveChartsCore.LvcPoint> {
    // /// <summary>
    // /// Initializes a new instance of the <see cref="PointMotionProperty"/> class.
    // /// </summary>
    // /// <param name="propertyName">Name of the property.</param>
    // public PointMotionProperty(string propertyName)
    //     : base(propertyName)
    // { }

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
