import * as PixUI from '@/PixUI'

export class Rx<T> extends PixUI.State<T> {
    private _value: T;

    public get Readonly(): boolean {
        return false;
    }

    public get Value(): T {
        return this._value;
    }

    public set Value(value: T) {
        //TODO:相等判断
        this._value = value;
        this.OnValueChanged();
    }

    public constructor(value: T) {
        super();
        this._value = value;
    }
}
