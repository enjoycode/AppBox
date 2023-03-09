import * as LiveChartsCore from '@/LiveChartsCore'

export class LineSegment extends LiveChartsCore.Animatable implements LiveChartsCore.IConsecutivePathSegment {
    private readonly _xiProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _yiProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _xjProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _yjProperty: LiveChartsCore.FloatMotionProperty;

    public constructor() {
        super();
        this._xiProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Xi", 0));
        this._yiProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Yi", 0));
        this._xjProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Xj", 0));
        this._yjProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Yj", 0));
    }

    public get Xi(): number {
        return this._xiProperty.GetMovement(this);
    }

    public set Xi(value: number) {
        this._xiProperty.SetMovement(value, this);
    }

    public get Yi(): number {
        return this._yiProperty.GetMovement(this);
    }

    public set Yi(value: number) {
        this._yiProperty.SetMovement(value, this);
    }

    public get Xj(): number {
        return this._xjProperty.GetMovement(this);
    }

    public set Xj(value: number) {
        this._xjProperty.SetMovement(value, this);
    }

    public get Yj(): number {
        return this._yjProperty.GetMovement(this);
    }

    public set Yj(value: number) {
        this._yjProperty.SetMovement(value, this);
    }

    public Id: number = 0;

    Follows(segment: LiveChartsCore.IConsecutivePathSegment) {
        this.IsValid = segment.IsValid;
        this.CurrentTime = segment.CurrentTime;
        this.RemoveOnCompleted = segment.RemoveOnCompleted;

        let xProp = segment.MotionProperties.GetAt("IConsecutivePathSegment.Xj");
        let yProp = segment.MotionProperties.GetAt("IConsecutivePathSegment.Yj");

        this.MotionProperties.GetAt("Xi").CopyFrom(xProp);
        this.MotionProperties.GetAt("Xj").CopyFrom(xProp);
        this.MotionProperties.GetAt("Yi").CopyFrom(yProp);
        this.MotionProperties.GetAt("Yj").CopyFrom(yProp);
    }
}
