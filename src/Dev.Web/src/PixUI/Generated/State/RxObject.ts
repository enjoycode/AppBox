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
        this.NotifyValueChanged();
    }
}

export abstract class RxObject<T extends object> {
    protected _target: T;

    public get Target(): T {
        return this._target;
    }

    public set Target(value: T) {
        let old = this._target;
        this._target = value;
        this.OnTargetChanged(old);
    }

    protected OnTargetChanged(old: T) {
        const props = Object.getOwnPropertyNames(this);
        for (let prop of props) {
            // @ts-ignore
            if (this[prop] instanceof PixUI.RxProperty) {
                // @ts-ignore
                this[prop].NotifyValueChanged();
            }
        }
    }
}
