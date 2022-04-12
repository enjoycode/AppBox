interface IListener<T> {
    callback: (arg: T) => void,
    target?: WeakRef<any>
}

export class Event<T = void> {
    private _listeners?: IListener<T>[];

    public Add(listener: (arg: T) => void, caller?: any) {
        if (!this._listeners)
            this._listeners = [];
        let item: IListener<T> = {callback: listener};
        if (caller)
            item.target = new WeakRef<any>(caller);
        this._listeners.push(item);
    }

    public Remove(listener: (arg: T) => void, caller?: any) {
        if (!this._listeners) return;

        for (let i = 0; i < this._listeners.length; i++) {
            const item = this._listeners[i];
            if (item.target?.deref() === caller && item.callback === listener) {
                this._listeners.splice(i, 1);
                break;
            }
        }
    }

    public Invoke(arg: T) {
        if (!this._listeners) return;
        for (let i = 0; i < this._listeners.length; i++) {
            const item = this._listeners[i];
            const target = item.target?.deref();
            const notAlive = item.target !== undefined && target === undefined;

            if (notAlive) {
                this._listeners.splice(i, 1);
                i--;
            } else {
                item.callback.call(target, arg);
            }
        }
    }

}
