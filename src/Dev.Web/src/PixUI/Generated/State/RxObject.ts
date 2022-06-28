import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class RxProperty<TObject extends object, TValue> extends PixUI.State<TValue> {
    public constructor(owner: RxObject<TObject>, getter: System.Func2<TObject, TValue>, setter: Nullable<System.Action2<TObject, TValue>> = null) {
        super();
        this._rxObject = owner;
        this._getter = getter;
        this._setter = setter;
    }

    private readonly _rxObject: RxObject<TObject>;
    private readonly _getter: System.Func2<TObject, TValue>;
    private readonly _setter: Nullable<System.Action2<TObject, TValue>>;

    public get Readonly(): boolean {
        return this._setter == null;
    }

    public get Value(): TValue {
        return this._getter(this._rxObject.Object);
    }

    public set Value(value: TValue) {
        if (this._setter == null)
            throw new System.NotSupportedException();
        this._setter(this._rxObject.Object, value);
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
