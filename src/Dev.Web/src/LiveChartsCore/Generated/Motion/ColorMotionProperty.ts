import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class ColorMotionProperty extends LiveChartsCore.MotionProperty<LiveChartsCore.LvcColor> {
    // /// <summary>
    // /// Initializes a new instance of the <see cref="ColorMotionProperty"/> class.
    // /// </summary>
    // /// <param name="propertyName">Name of the property.</param>
    // public ColorMotionProperty(string propertyName)
    //     : base(propertyName)
    // {
    //     fromValue = LvcColor.FromArgb(0, 0, 0, 0);
    //     toValue = LvcColor.FromArgb(0, 0, 0, 0);
    // }

    public constructor(propertyName: string, value: Nullable<LiveChartsCore.LvcColor> = null) {
        super(propertyName);
        if (value) {
            this.fromValue = (value).Clone();
            this.toValue = (value).Clone();
        } else {
            this.fromValue = new LiveChartsCore.LvcColor(0, 0, 0, 0);
            this.toValue = new LiveChartsCore.LvcColor(0, 0, 0, 0);
        }
    }

    protected OnGetMovement(progress: number): LiveChartsCore.LvcColor {
        return System.OpEquality(this.toValue, LiveChartsCore.LvcColor.Empty
        ) ? LiveChartsCore.LvcColor.Empty
            : LiveChartsCore.LvcColor.FromArgb(
                (Math.floor((this.fromValue.A + progress * (this.toValue.A - this.fromValue.A))) & 0xFF),
                (Math.floor((this.fromValue.R + progress * (this.toValue.R - this.fromValue.R))) & 0xFF),
                (Math.floor((this.fromValue.G + progress * (this.toValue.G - this.fromValue.G))) & 0xFF),
                (Math.floor((this.fromValue.B + progress * (this.toValue.B - this.fromValue.B))) & 0xFF));
    }
}
