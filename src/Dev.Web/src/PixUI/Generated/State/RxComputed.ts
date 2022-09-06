import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class RxComputed<T> extends PixUI.State<T> implements PixUI.IStateBindable {
    private readonly _getter: System.Func1<T>;
    private readonly _setter: Nullable<System.Action1<T>>;

    private constructor(getter: System.Func1<T>, setter: Nullable<System.Action1<T>>) {
        super();
        this._getter = getter;
        this._setter = setter;
    }

    public static MakeAsString<TR>(s: PixUI.State<TR>, formatter: Nullable<System.Func2<TR, string>> = null, parser: Nullable<System.Func2<string, TR>> = null): RxComputed<string> {
        let computed = new RxComputed<string>(formatter == null ? s.toString.bind(s) : () => formatter(s.Value), parser == null ? null : v => s.Value = parser(v)
        );
        s.AddBinding(computed, PixUI.BindingOptions.None);
        return computed;
    }

    public static Make1<TS, TR>(source: PixUI.State<TS>, getter: System.Func2<TS, TR>, setter: Nullable<System.Action1<TR>> = null): RxComputed<TR> {
        let computed = new RxComputed<TR>(() => getter(source.Value), setter);
        source.AddBinding(computed, PixUI.BindingOptions.None);
        return computed;
    }

    public static Make2<T1, T2, TR>(s1: PixUI.State<T1>, s2: PixUI.State<T2>, getter: System.Func3<T1, T2, TR>, setter: Nullable<System.Action1<TR>> = null): RxComputed<TR> {
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
        try {
            this._setter?.call(this, value);
        } catch (e: any) {
            //TODO: Log it
        }
    }

    public OnStateChanged(state: PixUI.StateBase, options: PixUI.BindingOptions) {
        this.NotifyValueChanged();
    }
}
