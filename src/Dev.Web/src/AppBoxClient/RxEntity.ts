import {Entity} from "@/AppBoxCore";
import {RxObject, State, StateBase} from "@/PixUI";
import {Action2, Func2} from "@/System";

class EntityMemberProxy<TEntity extends Entity, TMember> extends State<TMember> {
    constructor(rxEntity: RxEntity<TEntity>, getter: Func2<TEntity, TMember>, setter: Action2<TEntity, TMember>) {
        super();
        this._rxEntity = rxEntity;
        this._getter = getter;
        this._setter = setter;
    }

    private readonly _rxEntity: RxEntity<TEntity>;
    private readonly _getter: Func2<TEntity, TMember>;
    private readonly _setter: Action2<TEntity, TMember>;

    get Readonly(): boolean {
        return false;
    }

    get Value(): TMember {
        return this._getter(this._rxEntity.Target);
    }

    set Value(v: TMember) {
        this._setter(this._rxEntity.Target, v);
    }
}

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

        let proxy = new EntityMemberProxy(this, getter, setter);
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