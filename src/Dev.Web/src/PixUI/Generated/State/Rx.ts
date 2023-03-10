import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Rx<T> extends PixUI.State<T> {
    public constructor(value: T) {
        super();
        this._value = value;
    }

    private _value: T;

    get Readonly(): boolean {
        return false;
    }

    get Value(): T {
        return this._value;
    }

    set Value(value: T) {
        if (System.Equals(this._value, value)) return;
        this._value = value;
        this.NotifyValueChanged();
    }
}
