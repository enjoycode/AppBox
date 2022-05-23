import * as System from '@/System'
import * as PixUI from '@/PixUI'

export interface IStateBindable {
    OnStateChanged(state: StateBase, options: PixUI.BindingOptions): void;
}

export abstract class StateBase {
    private _bindings: Nullable<System.List<PixUI.Binding>>;

    public abstract get Readonly(): boolean;


    public AddBinding(target: IStateBindable, options: PixUI.BindingOptions) {
        if (this._bindings == null) {
            this._bindings = new System.List<PixUI.Binding>().Init([new PixUI.Binding(target, options)]);
        } else {
            if (!this._bindings.Any(b => (b.Target.deref() === target))) {
                this._bindings.Add(new PixUI.Binding(target, options));
            }
        }
    }

    public RemoveBinding(target: IStateBindable) {
        this._bindings?.RemoveAll(b => (b.Target.deref() === target));
    }

    protected OnValueChanged() {
        if (this._bindings == null) return;

        for (let i = 0; i < this._bindings.length; i++) {
            let target = this._bindings[i].Target.deref();
            if (target == null) {
                this._bindings.RemoveAt(i); //remove none alive binding
                i--;
            } else {
                (<IStateBindable><unknown>target).OnStateChanged(this, this._bindings[i].Options);
            }
        }
    }
}

export abstract class State<T> extends StateBase {
    public abstract get Value(): T ;
    public abstract set Value(value: T);

    public toString(): string {
        return this.Value?.toString() ?? "";
    }

    public AsStateOfString(formatter: Nullable<System.Func2<T, string>> = null, parser: Nullable<System.Func2<string, T>> = null): State<string> {
        return PixUI.RxComputed.MakeAsString(this, formatter, parser);
    }

    //TODO:临时解决隐式转换
    public static op_Implicit_From<T>(value: T): State<T> {
        return new PixUI.Rx<T>(value);
    }
}

export class StateProxy<T> extends State<T> implements IStateBindable {
    private _source: Nullable<State<T>>;
    private readonly _defaultValue: T;

    public constructor(source: Nullable<State<T>>, defaultValue: T) {
        super();
        this._source = source;
        this._source?.AddBinding(this, PixUI.BindingOptions.None);
        this._defaultValue = defaultValue;
    }

    public set Source(value: Nullable<State<T>>) {
        this._source?.RemoveBinding(this);
        this._source = value;
        this._source?.AddBinding(this, PixUI.BindingOptions.None);
    }

    public get Readonly(): boolean {
        return this._source?.Readonly ?? false;
    }

    public get Value(): T {
        return this._source == null ? this._defaultValue : this._source.Value;
    }

    public set Value(value: T) {
        if (this._source == null)
            throw new System.InvalidOperationException();
        this._source.Value = value;
    }

    public OnStateChanged(state: StateBase, options: PixUI.BindingOptions) {
        this.OnValueChanged();
    }

    public Init(props: Partial<StateProxy<T>>): StateProxy<T> {
        Object.assign(this, props);
        return this;
    }
}
