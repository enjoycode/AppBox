import * as PixUI from '@/PixUI'

export abstract class Simulation {
    /// <summary>
    /// How close to the actual end of the simulation a value at a particular time
    /// must be before [isDone] considers the simulation to be "done".
    /// </summary>
    /// <remarks>
    /// A simulation with an asymptotic curve would never technically be "done",
    /// but once the difference from the value at a particular time and the
    /// asymptote itself could not be seen, it would be pointless to continue. The
    /// tolerance defines how to determine if the difference could not be seen.
    /// </remarks>
    #Tolerance: PixUI.Tolerance;
    public get Tolerance() {
        return this.#Tolerance;
    }

    private set Tolerance(value) {
        this.#Tolerance = value;
    }

    public constructor(tolerance: Nullable<PixUI.Tolerance> = null) {
        this.Tolerance = tolerance ?? PixUI.Tolerance.Default;
    }

    /// <summary>
    /// The position of the object in the simulation at the given time.
    /// </summary>
    public abstract X(time: number): number;

    /// <summary>
    /// The velocity of the object in the simulation at the given time.
    /// </summary>
    public abstract Dx(time: number): number;

    /// <summary>
    ///  Whether the simulation is "done" at the given time.
    /// </summary>
    public abstract IsDone(time: number): boolean;
}

export class InterpolationSimulation extends Simulation {
    private readonly _durationInSeconds: number;
    private readonly _begin: number;
    private readonly _end: number;
    private readonly _curve: PixUI.Curve;

    public constructor(begin: number, end: number, duration: number, curve: PixUI.Curve,
                       scale: number) {
        super();
        console.assert(duration > 0);

        this._begin = begin;
        this._end = end;
        this._curve = curve;

        this._durationInSeconds = duration * scale / 1000;
    }

    public X(timeInSeconds: number): number {
        let t = clamp(timeInSeconds / this._durationInSeconds, 0.0, 1.0);
        if (t == 0.0) return this._begin;
        if (t == 1.0) return this._end;
        return this._begin + (this._end - this._begin) * this._curve.Transform(t);
    }

    public Dx(timeInSeconds: number): number {
        let epsilon = this.Tolerance.Time;
        return (this.X(timeInSeconds + epsilon) - this.X(timeInSeconds - epsilon)) / (2 * epsilon);
    }

    public IsDone(timeInSeconds: number): boolean {
        return timeInSeconds > this._durationInSeconds;
    }
}

export type DirectionSetter = (direction: PixUI.AnimationDirection) => any;

export class RepeatingSimulation extends Simulation {
    public constructor(initialValue: number, min: number, max: number, reverse: boolean,
                       period: number, directionSetter: DirectionSetter) {
        super();
        this._min = min;
        this._max = max;
        this._reverse = reverse;
        this._directionSetter = directionSetter;

        this._periodInSeconds = period / 1000;
        this._initialT = max == min ? 0 : initialValue / (max - min) * this._periodInSeconds;

        console.assert(this._periodInSeconds > 0);
        console.assert(this._initialT >= 0);
    }

    private readonly _min: number;
    private readonly _max: number;
    private readonly _reverse: boolean;
    private readonly _directionSetter: DirectionSetter;

    private readonly _periodInSeconds: number;
    private readonly _initialT: number;

    public X(timeInSeconds: number): number {
        console.assert(timeInSeconds >= 0);

        let totalTimeInSeconds = timeInSeconds + this._initialT;
        let t = (totalTimeInSeconds / this._periodInSeconds) % 1.0;
        let isPlayingReverse = ((Math.floor((totalTimeInSeconds / this._periodInSeconds)) & 0xFFFFFFFF) & 1) == 1;

        if (this._reverse && isPlayingReverse) {
            this._directionSetter(PixUI.AnimationDirection.Reverse);
            return PixUI.DoubleUtils.Lerp(this._max, this._min, t);
        } else {
            this._directionSetter(PixUI.AnimationDirection.Forward);
            return PixUI.DoubleUtils.Lerp(this._min, this._max, t);
        }
    }

    public Dx(timeInSeconds: number): number {
        return (this._max - this._min) / this._periodInSeconds;
    }

    public IsDone(time: number): boolean {
        return false;
    }
}
