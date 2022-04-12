import * as System from '@/System'
import * as PixUI from '@/PixUI'

export enum AnimationDirection {
    Forward,

    Reverse
}

export enum AnimationBehavior {
    Normal,
    Preserve
}

export class AnimationController extends PixUI.Animation<number> {
    private _value: number = 0;
    private _status: PixUI.AnimationStatus = 0;

    public Duration: Nullable<number>;

    public ReverseDuration: Nullable<number>;

    private _direction: AnimationDirection = 0;
    private readonly _animationBehavior: AnimationBehavior;
    private _simulation: Nullable<PixUI.Simulation>;

    private _ticker: Nullable<PixUI.Ticker>;

    #LastElapsedDuration: Nullable<number>;
    public get LastElapsedDuration() {
        return this.#LastElapsedDuration;
    }

    private set LastElapsedDuration(value) {
        this.#LastElapsedDuration = value;
    }

    private _lastReportedStatus: PixUI.AnimationStatus = PixUI.AnimationStatus.Dismissed;

    public readonly LowerBound: number = 0;
    public readonly UpperBound: number = 1;

    public constructor(duration: number, value: Nullable<number> = null, behavior: AnimationBehavior = AnimationBehavior.Normal) {
        super();
        this.Duration = duration;
        this._animationBehavior = behavior;
        this._direction = AnimationDirection.Forward;
        this._ticker = new PixUI.Ticker(this.Tick.bind(this));
        this.SetValueInternal(value ?? this.LowerBound);
    }

    public get IsAnimating(): boolean {
        return this._ticker != null && this._ticker.IsActive;
    }

    public get Status(): PixUI.AnimationStatus {
        return this._status;
    }

    public get Value(): number {
        return this._value;
    }

    private SetValue(newValue: number) {
        this.Stop();
        this.SetValueInternal(newValue);
        this.NotifyValueChanged();
        this.CheckStatusChanged();
    }

    private SetValueInternal(newValue: number) {
        this._value = clamp(newValue, this.LowerBound, this.UpperBound);
        if (this._value == this.LowerBound)
            this._status = PixUI.AnimationStatus.Dismissed;
        else if (this._value == this.UpperBound)
            this._status = PixUI.AnimationStatus.Completed;
        else
            this._status = this._direction == AnimationDirection.Forward
                ? PixUI.AnimationStatus.Forward
                : PixUI.AnimationStatus.Reverse;
    }

    public Stop(canceled: boolean = true) {
        this._ticker!.Stop(canceled); //first stop ticker
        this._simulation = null;
        this.LastElapsedDuration = null;
    }

    private Tick(elapsedInSeconds: number) {
        if (this._simulation == null) return; //TODO:临时判断是否已停止

        this.LastElapsedDuration = elapsedInSeconds;
        console.assert(elapsedInSeconds >= 0.0);

        this._value = clamp(this._simulation!.X(elapsedInSeconds), this.LowerBound, this.UpperBound);
        if (this._simulation!.IsDone(elapsedInSeconds)) {
            this._status = this._direction == AnimationDirection.Forward
                ? PixUI.AnimationStatus.Completed
                : PixUI.AnimationStatus.Dismissed;
            this.Stop(false);
        }

        this.NotifyValueChanged();
        this.CheckStatusChanged();

// #if !__WEB__ && DEBUG
//             Console.WriteLine(
//                 $"AnimationController Tick: {elapsedInSeconds} Value={_value} Thread={Thread.CurrentThread.ManagedThreadId}");
// #endif
    }


    public AnimateTo(target: number, duration: Nullable<number> = null, curve: Nullable<PixUI.Curve> = null) {
        if (this.Duration == null && duration == null)
            throw new System.Exception("Duration not set");

        curve ??= PixUI.Curves.Linear;
        this._direction = AnimationDirection.Forward;
        this.AnimateToInternal(target, duration, curve);
    }

    public AnimateBack(target: number, duration: Nullable<number> = null, curve: Nullable<PixUI.Curve> = null) {
        if (this.Duration == null && this.ReverseDuration == null && duration == null)
            throw new System.Exception("Duration not set");
        curve ??= PixUI.Curves.Linear;
        this._direction = AnimationDirection.Reverse;
        this.AnimateToInternal(target, duration, curve);
    }

    private AnimateToInternal(target: number, duration: Nullable<number> = null, curve: Nullable<PixUI.Curve> = null) {
        curve ??= PixUI.Curves.Linear;

        let scale = 1.0;
        let simulationDuration = duration;
        if (simulationDuration == null) {
            console.assert(!(this.Duration == null && this._direction == AnimationDirection.Forward));
            console.assert(!(this.Duration == null && this._direction == AnimationDirection.Reverse &&
                this.ReverseDuration == null));

            let range = this.UpperBound - this.LowerBound;
            let remainingFraction = isFinite(range) ? Math.abs(target - this._value) / range : 1.0;
            let directionDuration = this._direction == AnimationDirection.Reverse && this.ReverseDuration != null
                ? this.ReverseDuration : this.Duration!;
            simulationDuration = <number><any>(directionDuration * remainingFraction);
        } else if (target == this._value) {
            simulationDuration = 0; // Already at target, don't animate.
        }

        this.Stop();

        if (simulationDuration == 0) {
            if (this._value != target) {
                this._value = clamp(target, this.LowerBound, this.UpperBound);
                this.NotifyValueChanged();
            }

            this._status = this._direction == AnimationDirection.Forward
                ? PixUI.AnimationStatus.Completed
                : PixUI.AnimationStatus.Dismissed;
            this.CheckStatusChanged();
            return;
        }

        console.assert(simulationDuration > 0);
        console.assert(!this.IsAnimating);
        this.StartSimulation(new InterpolationSimulation(this._value, target, simulationDuration, curve, scale));
    }

    private StartSimulation(simulation: PixUI.Simulation) {
        console.assert(!this.IsAnimating);

        this._simulation = simulation;
        this.LastElapsedDuration = 0.0;
        this._value = clamp(simulation.X(0.0), this.LowerBound, this.UpperBound);
        this._ticker!.Start();
        this._status = this._direction == AnimationDirection.Forward
            ? PixUI.AnimationStatus.Forward
            : PixUI.AnimationStatus.Reverse;
        this.CheckStatusChanged();
    }

    public Forward(from: Nullable<number> = null) {
        if (this.Duration == null) throw new System.Exception("Duration not set");
        this._direction = AnimationDirection.Forward;
        if (from != null)
            this.SetValue(from);

        this.AnimateToInternal(this.UpperBound);
    }

    public Reverse(from: Nullable<number> = null) {
        if (this.Duration == null && this.ReverseDuration == null)
            throw new System.Exception("Duration and ReverseDuration not set");
        this._direction = AnimationDirection.Reverse;
        if (from != null)
            this.SetValue(from);

        this.AnimateToInternal(this.LowerBound);
    }

    public Reset() {
        this.SetValue(this.LowerBound);
    }

    public Dispose() {
        this._ticker?.Stop(true);
        this._ticker = null;
    }


    public readonly ValueChanged = new System.Event();
    public readonly StatusChanged = new System.Event<PixUI.AnimationStatus>();

    private CheckStatusChanged() {
        let newStatus = this._status;
        if (this._lastReportedStatus == newStatus) return;

        this._lastReportedStatus = newStatus;
        this.StatusChanged.Invoke(newStatus);
    }

    private NotifyValueChanged() {
        this.ValueChanged.Invoke();
    }

    public Init(props: Partial<AnimationController>): AnimationController {
        Object.assign(this, props);
        return this;
    }

}

export class InterpolationSimulation extends PixUI.Simulation {
    private readonly _durationInSeconds: number;
    private readonly _begin: number;
    private readonly _end: number;
    private readonly _curve: PixUI.Curve;

    public constructor(begin: number, end: number, duration: number, curve: PixUI.Curve, scale: number) {
        super();
        console.assert(duration > 0);

        this._begin = begin;
        this._end = end;
        this._curve = curve;

        this._durationInSeconds = (duration * scale) / 1000;
    }

    public X(timeInSeconds: number): number {
        let t = clamp((timeInSeconds / this._durationInSeconds), 0.0, 1.0);
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

    public Init(props: Partial<InterpolationSimulation>): InterpolationSimulation {
        Object.assign(this, props);
        return this;
    }
}
