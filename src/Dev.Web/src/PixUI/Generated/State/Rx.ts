import * as System from '@/System'
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

    public AsStateOfString(formatter: Nullable<System.Func2<T, string>> = null, parser: Nullable<System.Func2<string, T>> = null): PixUI.State<string> {
        return PixUI.RxComputed.MakeAsString(this, formatter, parser);
    }
}
