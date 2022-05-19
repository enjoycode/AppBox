export class DelayTask {
    private _flag: number = 0;
    private readonly _millisecondsDelay: number = 0;
    private readonly _action: () => void;

    public constructor(millisecondsDelay: number, action: () => void) {
        this._millisecondsDelay = millisecondsDelay;
        this._action = action;
    }

    public Run() {
        this._flag++;
        if (this._flag !== 1) return;

        this.RunInternal();
    }

    private RunInternal() {
        setTimeout(() => {
            if (this._flag === 1) {
                this._flag = 0;
                this._action();
            } else {
                this._flag = 1;
                this.RunInternal();
            }
        }, this._millisecondsDelay)
    }

}