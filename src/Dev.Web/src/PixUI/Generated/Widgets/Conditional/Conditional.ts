import * as PixUI from '@/PixUI'
import * as System from '@/System'

export class WhenBuilder<T> {
    public readonly Match: System.Predicate<T>;
    public readonly Builder: System.Func1<PixUI.Widget>;
    private _cachedWidget: Nullable<PixUI.Widget>;

    public constructor(match: System.Predicate<T>, builder: System.Func1<PixUI.Widget>) {
        this.Match = match;
        this.Builder = builder;
    }

    public GetWidget(): Nullable<PixUI.Widget> {
        if (this._cachedWidget == null)
            this._cachedWidget = this.Builder();
        return this._cachedWidget;
    }

    public Init(props: Partial<WhenBuilder<T>>): WhenBuilder<T> {
        Object.assign(this, props);
        return this;
    }
}

/// <summary>
/// 根据状态条件构建不同的子组件
/// </summary>
export class Conditional<T> extends PixUI.DynamicView //where T: IEquatable<T>
{
    public constructor(state: PixUI.State<T>, whens: WhenBuilder<T>[]) {
        super();
        this.IsLayoutTight = true;
        this._state = this.Bind(state, PixUI.BindingOptions.AffectsLayout);
        this._whens = whens;

        this.Child = this.MakeChildByCondition();
    }

    private readonly _state: PixUI.State<T>;
    private readonly _whens: WhenBuilder<T>[];

    //TODO: add AutoDispose property to dispose not used widget

    private MakeChildByCondition(): Nullable<PixUI.Widget> {
        for (const item of this._whens) {
            //EqualityComparer<T>.Default.Equals(item.StateValue, _state.Value)
            if (item.Match(this._state.Value)) {
                return item.GetWidget();
            }
        }

        return null;
    }

    public OnStateChanged(state: PixUI.StateBase, options: PixUI.BindingOptions) {
        if ((state === this._state)) {
            let newChild = this.MakeChildByCondition();
            this.ReplaceTo(newChild);
            return;
        }

        super.OnStateChanged(state, options);
    }

    public Init(props: Partial<Conditional<T>>): Conditional<T> {
        Object.assign(this, props);
        return this;
    }
}
