import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class RxComputed<T> extends PixUI.State<T> implements PixUI.IStateBindable {
    private readonly _getter: System.Func<T>;
    private readonly _setter: Nullable<System.Action<T>>;

    private constructor(getter: System.Func<T>, setter: Nullable<System.Action<T>>) {
        super();
        this._getter = getter;
        this._setter = setter;
    }

    public static MakeAsString<TR>(s: PixUI.State<TR>, formatter: Nullable<System.Func<TR, string>> = null, parser: Nullable<System.Func<string, TR>> = null): RxComputed<string> {
        // @ts-ignore
        let computed = new RxComputed<string>(formatter == null ? () => s.toString() : () => formatter(s.Value), parser == null ? null : v => s.Value = parser(v)
        );
        s.AddBinding(computed, PixUI.BindingOptions.None);
        return computed;
    }

    public static Make1<TS, TR>(source: PixUI.State<TS>, getter: System.Func<TS, TR>): RxComputed<TR> {
        // @ts-ignore
        let computed = new RxComputed<TR>(() => getter(source.Value), null);
        source.AddBinding(computed, PixUI.BindingOptions.None);
        return computed;
    }

    public static Make2<T1, T2, TR>(s1: PixUI.State<T1>, s2: PixUI.State<T2>, getter: System.Func<T1, T2, TR>, setter: Nullable<System.Action<TR>> = null): RxComputed<TR> {
        // @ts-ignore
        let computed = new RxComputed<TR>(() => getter(s1.Value, s2.Value), setter);
        s1.AddBinding(computed, PixUI.BindingOptions.None);
        s2.AddBinding(computed, PixUI.BindingOptions.None);
        return computed;
    }

    public get Readonly(): boolean {
        return this._setter == null;
    }

    public get Value(): T {
        return this._getter();
    }

    public set Value(value: T) {
        this._setter?.call(this, value);
    }

    public OnStateChanged(state: PixUI.StateBase, options: PixUI.BindingOptions) {
        this.OnValueChanged();
    }
}
