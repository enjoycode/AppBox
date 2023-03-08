import * as LiveChartsCore from '@/LiveChartsCore'

export class SizeMotionProperty extends LiveChartsCore.MotionProperty<LiveChartsCore.LvcSize> {


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
