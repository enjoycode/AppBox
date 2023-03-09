import * as System from '@/System'

export class ObjectNotifier<T extends object> {
    private _changeHandler: Nullable<System.Action1<T>>;

    public set OnChange(value: System.Action1<T>) {
        this._changeHandler = value;
    }

    public Notify(obj: T) {
        this._changeHandler?.call(this, obj);
    }
}
