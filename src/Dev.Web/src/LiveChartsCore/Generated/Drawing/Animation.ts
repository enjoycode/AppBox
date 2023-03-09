import * as System from '@/System'

export class Animation {
    public _duration: bigint = 0n;
    public _animationCompletedCount: number = 0;
    public _repeatTimes: number = 0;

    public constructor() {
        this.EasingFunction = t => t;
    }

    // /// <summary>
    // /// Initializes a new instance of the <see cref="Animation"/> class.
    // /// </summary>
    // /// <param name="easingFunction">The easing function.</param>
    // /// <param name="duration">The duration.</param>
    // public Animation(Func<float, float>? easingFunction, TimeSpan duration)
    // {
    //     EasingFunction = easingFunction;
    //     _duration = (long)duration.TotalMilliseconds;
    // }

    // /// <summary>
    // /// Initializes a new instance of the <see cref="Animation"/> class.
    // /// </summary>
    // /// <param name="easingFunction">The easing function.</param>
    // /// <param name="duration">The duration.</param>
    // /// <param name="repeatTimes">The repeat times.</param>
    // public Animation(Func<float, float> easingFunction, TimeSpan duration, int repeatTimes)
    // {
    //     EasingFunction = easingFunction;
    //     _duration = (long)duration.TotalMilliseconds;
    //     _repeatTimes = repeatTimes;
    // }

    // /// <summary>
    // /// Initializes a new instance of the <see cref="Animation"/> class.
    // /// </summary>
    // /// <param name="easingFunction">The easing function.</param>
    // /// <param name="duration">The duration.</param>
    // /// <param name="repeatTimes">The repeat times.</param>
    // public Animation(Func<float, float> easingFunction, long duration, int repeatTimes)
    // {
    //     EasingFunction = easingFunction;
    //     _duration = duration;
    //     _repeatTimes = repeatTimes;
    // }

    // /// <summary>
    // /// Initializes a new instance of the <see cref="Animation"/> class.
    // /// </summary>
    // /// <param name="animation">The animation.</param>
    // public Animation(Animation animation)
    // {
    //     EasingFunction = animation.EasingFunction;
    //     _duration = animation._duration;
    //     _repeatTimes = animation._repeatTimes;
    // }

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

    // /// <summary>
    // /// Sets the duration.
    // /// </summary>
    // /// <param name="duration">The duration.</param>
    // /// <returns>The animation instance</returns>
    // public Animation WithDuration(long duration)
    // {
    //     _duration = duration;
    //     return this;
    // }

    public RepeatTimes(times: number): Animation {
        this._repeatTimes = times;
        return this;
    }

    public RepeatIndefinitely(): Animation {
        this._repeatTimes = 2147483647;
        return this;
    }
}
