import * as LiveChartsCore from '@/LiveChartsCore'

export class SizeMotionProperty extends LiveChartsCore.MotionProperty<LiveChartsCore.LvcSize> {
    // /// <summary>
    // /// Initializes a new instance of the <see cref="SizeMotionProperty"/> class.
    // /// </summary>
    // /// <param name="propertyName">Name of the property.</param>
    // public SizeMotionProperty(string propertyName)
    //     : base(propertyName)
    // { }

    public constructor(propertyName: string, value: LiveChartsCore.LvcSize) {
        super(propertyName);
        this.fromValue = (value).Clone();
        this.toValue = (value).Clone();
    }

    protected OnGetMovement(progress: number): LiveChartsCore.LvcSize {
        return new LiveChartsCore.LvcSize(this.fromValue.Width + progress * (this.toValue.Width - this.fromValue.Width),
            this.fromValue.Height + progress * (this.toValue.Height - this.fromValue.Height));
    }
}
