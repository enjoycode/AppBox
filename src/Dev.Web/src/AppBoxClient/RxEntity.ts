import {Entity} from "@/AppBoxCore";
import {RxObject, RxProperty, State, StateBase} from "@/PixUI";
import {Action2, Func2} from "@/System";

export class RxEntity<T extends Entity> extends RxObject<T> {
    constructor(empty: T) {
        super();

        this._ds = new Map<number, StateBase>();
        this._target = empty;
        this._target.PropertyChanged.Add(this.OnTargetPropertyChanged, this);
    }

    private readonly _ds: Map<number, StateBase>;

    public Observe<TMember>(memberId: number, getter: Func2<T, TMember>, setter: Action2<T, TMember>): State<TMember> {
        let state = this._ds.get(memberId);
        if (state) return <State<TMember>>state;

        let proxy = new RxProperty(() => getter(this._target), v => setter(this._target, v), false);
        this._ds.set(memberId, proxy);
        return proxy;
    }

    private OnTargetPropertyChanged(memberId: number) {
        let state = this._ds.get(memberId);
        state?.NotifyValueChanged();
    }

    protected OnTargetChanged(old: T) {
        old.PropertyChanged.Remove(this.OnTargetPropertyChanged, this);
        this._target.PropertyChanged.Add(this.OnTargetPropertyChanged, this);

        this._ds.forEach(state => {
            state.NotifyValueChanged();
        });
    }
}