import * as System from '@/System'

export class Ticker {
    private static readonly Interval: number = 16;

    private readonly _onTick: System.Action1<number>;

    private _startTime: Nullable<System.DateTime>;
    private _animationId: number = 0;
    private _isActive: boolean = false;

    public get IsActive(): boolean {
        return this._isActive;
    }

    protected get ShouldScheduleTick(): boolean {
        return this._isActive;
    }

    public constructor(onTick: System.Action1<number>) {
        this._onTick = onTick;
    }

    public Start() {
        //Debug.Assert(_startTime == null);
        this._startTime = System.DateTime.UtcNow;
        this._animationId++;
        this._isActive = true;
        if (this.ShouldScheduleTick)
            this.ScheduleTick();
    }

    public Stop(canceled: boolean = false) {
        if (!this._isActive) return;

        this._isActive = false;
        this._startTime = null;
    }

    private ScheduleTick(rescheduling = false) {
        let id = this._animationId;
        requestAnimationFrame(() => this.Tick(System.DateTime.UtcNow, id));
    }

    private Tick(timeStamp: System.DateTime, id: number) {
        if (id != this._animationId) return;

        this._startTime ??= timeStamp;
        this._onTick((System.DateTime.op_Subtraction(timeStamp, this._startTime)).TotalSeconds);

        if (this.ShouldScheduleTick)
            this.ScheduleTick(true);
    }
}
