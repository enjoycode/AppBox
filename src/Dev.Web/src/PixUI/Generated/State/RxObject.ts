import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class RxProperty<T> extends PixUI.State<T> {
    public constructor(getter: System.Func1<T>, setter: Nullable<System.Action1<T>> = null) {
        super();
        this._getter = getter;
        this._setter = setter;
    }

    private readonly _getter: System.Func1<T>;
    private readonly _setter: Nullable<System.Action1<T>>;

    public get Readonly(): boolean {
        return this._setter == null;
    }

    public get Value(): T {
        return this._getter();
    }

    public set Value(value: T) {
        if (this._setter == null)
            throw new System.NotSupportedException();
        this._setter(value);
        this.OnValueChanged();
    }

    public NotifyValueChanged() {
        this.OnValueChanged();
    }
}

export abstract class RxObject<T extends object> {
    private _object: T;

    public get Object(): T {
        return this._object;
    }

    public set Object(value: T) {
        this._object = value;
        this.OnObjectChanged();
    }

    private OnObjectChanged() {
        const props = Object.getOwnPropertyNames(this);
        for (let prop in props) {
            // @ts-ignore
            if (this[prop] instanceof PixUI.RxProperty) {
                // @ts-ignore
                this[prop].NotifyValueChanged();
            }
        }
    }
}
