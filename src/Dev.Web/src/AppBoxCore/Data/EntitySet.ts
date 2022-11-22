import {DbEntity, Entity, IBinSerializable, IInputStream, IOutputStream, PersistentState} from "@/AppBoxCore";
import {Action2, Func1, List} from "@/System";

export class EntitySet<T extends Entity> extends List<T> implements IBinSerializable {

    constructor(entityRefSetter: Action2<T, boolean>, creator: Func1<T>) {
        super();
        this._entityRefSetter = entityRefSetter;
        this._creator = creator;
    }

    private readonly _entityRefSetter: Action2<T, boolean>;
    private readonly _creator: Func1<T>;
    private _removed: List<T> | null = null;

    public Add(item: T): void {
        this._entityRefSetter(item, false);
        super.Add(item);
    }

    public Remove(item: T): boolean {
        let res = super.Remove(item);
        if (res)
            this.RemoveInternal(item);
        return res;
    }

    private RemoveInternal(item: T) {
        if (item instanceof DbEntity && item.PersistentState != PersistentState.Detached) {
            this._removed ??= new List<T>();
            this._removed.Add(item);
        }

        this._entityRefSetter(item, true);
    }

    //region ====Serialization====
    WriteTo(bs: IOutputStream): void {
        bs.WriteVariant(this.length);
        for (const item of this) {
            (<any>bs).Serialize(item);
        }
        bs.WriteVariant(this._removed?.length ?? 0);
        if (this._removed != null) {
            for (const item of this._removed) {
                (<any>bs).Serialize(item);
            }
        }
    }

    ReadFrom(bs: IInputStream): void {
        let count = bs.ReadVariant();
        for (let i = 0; i < count; i++) {
            super.Add((<any>bs).DeserializeEntity(/*this._creator*/ null));
        }

        count = bs.ReadVariant();
        if (count > 0) {
            this._removed = new List<T>();
            for (let i = 0; i < count; i++) {
                this._removed.Add((<any>bs).DeserializeEntity(/*this._creator*/ null));
            }
        }
    }

    //endregion
}
