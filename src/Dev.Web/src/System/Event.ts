interface IListener<T1, T2> {
    callback: (arg1: T1, arg2: T2) => void,
    target?: WeakRef<any>
}

export class Event<T1 = void, T2 = void> {
    private _listeners?: IListener<T1, T2>[];
    private _it: number = -1;

    public Add(listener: (arg1: T1, arg2: T2) => void, caller?: any) {
        if (!this._listeners)
            this._listeners = [];
        let item: IListener<T1, T2> = {callback: listener};
        if (caller)
            item.target = new WeakRef<any>(caller);
        this._listeners.push(item);
    }

    public Remove(listener: (arg1: T1, arg2: T2) => void, caller?: any) {
        if (!this._listeners) return;

        for (let i = 0; i < this._listeners.length; i++) {
            const item = this._listeners[i];
            if (item.target?.deref() === caller && item.callback === listener) {
                this._listeners.splice(i, 1);
                break;
            }
        }

        if (this._it >= 0) { //正在激发过程中移除自己
            this._it--;
        }
    }

    public Invoke(arg1: T1, arg2: T2) {
        if (!this._listeners) return;

        this._it = 0;
        while (this._it < this._listeners.length) {
            const item = this._listeners[this._it];
            const target = item.target?.deref();
            const notAlive = item.target !== undefined && target === undefined;

            if (notAlive) {
                this._listeners.splice(this._it, 1);
            } else {
                item.callback.call(target, arg1, arg2);
                this._it++;
            }
        }
        this._it = -1;
    }

}