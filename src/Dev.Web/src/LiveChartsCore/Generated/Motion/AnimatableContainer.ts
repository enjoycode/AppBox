import * as LiveChartsCore from '@/LiveChartsCore'

export class AnimatableContainer extends LiveChartsCore.Animatable {
    private readonly _locationProperty: LiveChartsCore.PointMotionProperty;
    private readonly _sizeMotionProperty: LiveChartsCore.SizeMotionProperty;

    public constructor() {
        super();
        this._locationProperty = this.RegisterMotionProperty(new LiveChartsCore.PointMotionProperty("Location", new LiveChartsCore.LvcPoint()));
        this._sizeMotionProperty = this.RegisterMotionProperty(new LiveChartsCore.SizeMotionProperty("Size", new LiveChartsCore.LvcSize()));
    }

    public get Location(): LiveChartsCore.LvcPoint {
        return this._locationProperty.GetMovement(this);
    }

    public set Location(value: LiveChartsCore.LvcPoint) {
        this._locationProperty.SetMovement((value).Clone(), this);
    }

    public get Size(): LiveChartsCore.LvcSize {
        return this._sizeMotionProperty.GetMovement(this);
    }

    public set Size(value: LiveChartsCore.LvcSize) {
        this._sizeMotionProperty.SetMovement((value).Clone(), this);
    }

    #HasPreviousState: boolean = false;
    public get HasPreviousState() {
        return this.#HasPreviousState;
    }

    public set HasPreviousState(value) {
        this.#HasPreviousState = value;
    }
}
