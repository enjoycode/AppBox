import * as System from '@/System'

export class Animation {
    public _duration: bigint = 0n;
    public _animationCompletedCount: number = 0;
    public _repeatTimes: number = 0;

    public constructor() {
        this.EasingFunction = t => t;
    }


    public EasingFunction: Nullable<System.Func2<number, number>>;

    public get Duration(): bigint {
        return this._duration;
    }

    public set Duration(value: bigint) {
        this._duration = value;
    }

    public get Repeat(): number {
        return this._repeatTimes;
    }

    public set Repeat(value: number) {
        this._repeatTimes = value;
    }

    public WithEasingFunction(easing: Nullable<System.Func2<number, number>>): Animation {
        this.EasingFunction = easing;
        return this;
    }

    public WithDuration(duration: System.TimeSpan): Animation {
        this._duration = BigInt(duration.TotalMilliseconds.toFixed(0));
        return this;
    }


    public RepeatTimes(times: number): Animation {
        this._repeatTimes = times;
        return this;
    }

    public RepeatIndefinitely(): Animation {
        this._repeatTimes = 2147483647;
        return this;
    }
}
