import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class MotionProperty<T> implements LiveChartsCore.IMotionProperty {

    public fromValue: Nullable<T> = null;

    public toValue: Nullable<T> = null;

    private _startTime: bigint = 0n;
    private _endTime: bigint = 0n;
    private _requiresToInitialize: boolean = true;

    protected constructor(propertyName: string) {
        this.PropertyName = propertyName;
    }

    public get FromValue(): Nullable<T> {
        return this.fromValue;
    }

    public get ToValue(): Nullable<T> {
        return this.toValue;
    }

    public Animation: Nullable<LiveChartsCore.Animation>;

    #PropertyName: string = "";
    public get PropertyName() {
        return this.#PropertyName;
    }

    private set PropertyName(value) {
        this.#PropertyName = value;
    }

    public IsCompleted: boolean = false;

    public CopyFrom(source: LiveChartsCore.IMotionProperty) {
        let typedSource = <MotionProperty<T>><unknown>source;

        this.fromValue = typedSource.FromValue;
        this.toValue = typedSource.ToValue;
        this._startTime = typedSource._startTime;
        this._endTime = typedSource._endTime;
        this._requiresToInitialize = typedSource._requiresToInitialize;
        this.Animation = typedSource.Animation;
        this.IsCompleted = typedSource.IsCompleted;
    }

    public SetMovement(value: T, animatable: LiveChartsCore.Animatable) {
        this.fromValue = this.GetMovement(animatable);
        this.toValue = value;
        if (this.Animation != null) {
            if (animatable.CurrentTime == BigInt('-9223372036854775808')) {
                this._requiresToInitialize = true;
            } else {
                this._startTime = animatable.CurrentTime;
                this._endTime = animatable.CurrentTime + this.Animation._duration;
            }
            this.Animation._animationCompletedCount = 0;
            this.IsCompleted = false;
            this._requiresToInitialize = true;
        }
        animatable.IsValid = false;
    }

    public GetMovement(animatable: LiveChartsCore.Animatable): T {


        let fromValueIsNull = this.fromValue == null;
        if (this.Animation == null || this.Animation.EasingFunction == null || fromValueIsNull || this.IsCompleted) return this.OnGetMovement(1);

        if (this._requiresToInitialize || this._startTime == BigInt('-9223372036854775808')) {
            this._startTime = animatable.CurrentTime;
            this._endTime = animatable.CurrentTime + this.Animation._duration;
            this._requiresToInitialize = false;
        }


        animatable.IsValid = false;

        let t1: number = Number(animatable.CurrentTime - this._startTime);
        let t2: number = Number(this._endTime - this._startTime);
        let p = t1 / t2;

        if (p >= 1) {

            p = 1;
            this.Animation._animationCompletedCount++;
            this.IsCompleted = this.Animation._repeatTimes != 2147483647 && this.Animation._repeatTimes < this.Animation._animationCompletedCount;
            if (!this.IsCompleted) {
                this._startTime = animatable.CurrentTime;
                this._endTime = animatable.CurrentTime + this.Animation._duration;
                this.IsCompleted = false;
            }
        }

        let fp = this.Animation.EasingFunction(p);
        return this.OnGetMovement(fp);
    }

    public GetCurrentValue(animatable: LiveChartsCore.Animatable): T {
        {
            let t1: number = Number(animatable.CurrentTime - this._startTime);
            let t2: number = Number(this._endTime - this._startTime);
            let p = t1 / t2;
            if (p >= 1) p = 1;
            if (animatable.CurrentTime == BigInt('-9223372036854775808')) p = 0;
            let fp = this.Animation?.EasingFunction?.call(this, p) ?? 1;
            return this.OnGetMovement(fp);
        }
    }

    protected abstract OnGetMovement(progress: number): T ;
}
