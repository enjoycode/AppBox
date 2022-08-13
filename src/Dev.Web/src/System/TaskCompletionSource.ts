export class TaskCompletionSource<T = void> {
    private readonly _promise: Promise<T>;
    private _resolve: (value: T) => void;
    private _reject: (reason?: any) => void;

    public constructor() {
        this._promise = new Promise<T>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    public get Task(): Promise<T> {
        return this._promise;
    }

    public SetResult(result: T): void {
        this._resolve(result);
    }

    public SetException(exception?: any): void {
        this._reject(exception);
    }
}