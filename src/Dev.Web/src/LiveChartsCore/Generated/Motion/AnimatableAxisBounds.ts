import * as LiveChartsCore from '@/LiveChartsCore'

export class AnimatableAxisBounds extends LiveChartsCore.Animatable {
    private readonly _maxLimitProperty: LiveChartsCore.NullableDoubleMotionProperty;
    private readonly _minLimitProperty: LiveChartsCore.NullableDoubleMotionProperty;
    private readonly _maxDataBoundProperty: LiveChartsCore.DoubleMotionProperty;
    private readonly _minDataBoundProperty: LiveChartsCore.DoubleMotionProperty;
    private readonly _maxVisibleBoundProperty: LiveChartsCore.DoubleMotionProperty;
    private readonly _minVisibleBoundProperty: LiveChartsCore.DoubleMotionProperty;

    public constructor() {
        super();
        this._maxLimitProperty = this.RegisterMotionProperty(new LiveChartsCore.NullableDoubleMotionProperty("MaxLimit", null));
        this._minLimitProperty = this.RegisterMotionProperty(new LiveChartsCore.NullableDoubleMotionProperty("MinLimit", null));
        this._maxDataBoundProperty = this.RegisterMotionProperty(new LiveChartsCore.DoubleMotionProperty("MaxDataBound", 0));
        this._minDataBoundProperty = this.RegisterMotionProperty(new LiveChartsCore.DoubleMotionProperty("MinDataBound", 0));
        this._maxVisibleBoundProperty = this.RegisterMotionProperty(new LiveChartsCore.DoubleMotionProperty("MaxVisibleBound", 0));
        this._minVisibleBoundProperty = this.RegisterMotionProperty(new LiveChartsCore.DoubleMotionProperty("MinVisibleBound", 0));
    }

    public get MaxLimit(): Nullable<number> {
        return this._maxLimitProperty.GetMovement(this);
    }

    public set MaxLimit(value: Nullable<number>) {
        this._maxLimitProperty.SetMovement(value, this);
    }

    public get MinLimit(): Nullable<number> {
        return this._minLimitProperty.GetMovement(this);
    }

    public set MinLimit(value: Nullable<number>) {
        this._minLimitProperty.SetMovement(value, this);
    }

    public get MaxDataBound(): number {
        return this._maxDataBoundProperty.GetMovement(this);
    }

    public set MaxDataBound(value: number) {
        this._maxDataBoundProperty.SetMovement(value, this);
    }

    public get MinDataBound(): number {
        return this._minDataBoundProperty.GetMovement(this);
    }

    public set MinDataBound(value: number) {
        this._minDataBoundProperty.SetMovement(value, this);
    }

    public get MaxVisibleBound(): number {
        return this._maxVisibleBoundProperty.GetMovement(this);
    }

    public set MaxVisibleBound(value: number) {
        this._maxVisibleBoundProperty.SetMovement(value, this);
    }

    public get MinVisibleBound(): number {
        return this._minVisibleBoundProperty.GetMovement(this);
    }

    public set MinVisibleBound(value: number) {
        this._minVisibleBoundProperty.SetMovement(value, this);
    }

    #HasPreviousState: boolean = false;
    public get HasPreviousState() {
        return this.#HasPreviousState;
    }

    public set HasPreviousState(value) {
        this.#HasPreviousState = value;
    }
}
