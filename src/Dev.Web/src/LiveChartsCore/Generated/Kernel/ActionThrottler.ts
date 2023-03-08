import * as System from '@/System'

export class ActionThrottler {
    private readonly _sync: any = {};
    private readonly _action: System.Func1<Promise<void>>;
    private _isWaiting: boolean = false;

    public constructor(targetAction: System.Func1<Promise<void>>, time: System.TimeSpan) {
        this._action = targetAction;
        this.ThrottlerTimeSpan = time;
    }


    public ThrottlerTimeSpan: System.TimeSpan = System.TimeSpan.Empty.Clone();

    public async Call() {
        {

            if (this._isWaiting) return;
            this._isWaiting = true;
        }

        await new Promise<void>($resolve => setTimeout(() => $resolve(), (Math.floor(this.ThrottlerTimeSpan.TotalMilliseconds) & 0xFFFFFFFF)));
        {
            this._isWaiting = false;
        }

        await Promise.any([this._action()]);
    }

    public ForceCall() {
        this._action();
    }
}
