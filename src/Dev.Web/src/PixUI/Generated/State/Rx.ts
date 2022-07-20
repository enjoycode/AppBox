import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Rx<T> extends PixUI.State<T> {
    public constructor(value: T) {
        super();
        this._value = value;
    }

    private _value: T;

    public get Readonly(): boolean {
        return false;
    }

    public get Value(): T {
        return this._value;
    }

    public set Value(value: T) {
        if (System.Equals(this._value, value)) return;
        this._value = value;
        this.OnValueChanged();
    }
}
