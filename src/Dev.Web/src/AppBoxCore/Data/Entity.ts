import {IBinSerializable, IInputStream, IOutputStream} from "@/AppBoxCore";
import {Event} from "@/System";

export abstract class Entity implements IBinSerializable {
    public abstract get ModelId(): bigint;

    protected _ignoreSerializeNavigateMembers: boolean = false;

    public IgnoreSerializeNavigateMembers(): typeof this {
        this._ignoreSerializeNavigateMembers = true;
        return this;
    }

    public readonly PropertyChanged = new Event<number>();

    protected OnPropertyChanged(memberId: number) {
        this.PropertyChanged.Invoke(memberId);
    }

    ReadFrom(bs: IInputStream): void {
    }

    WriteTo(bs: IOutputStream): void {
    }
}

export enum PersistentState {
    Detached = 0,
    Unchanged = 1,
    Modified = 2,
    Deleted = 3,
}

export abstract class DbEntity extends Entity {
    private _persistentState: PersistentState = PersistentState.Detached;

    public get PersistentState(): PersistentState {
        return this._persistentState;
    }

    private _changedMembers: number[] | null = null;

    protected OnPropertyChanged(memberId: number) {
        if (this._persistentState == PersistentState.Unchanged || this._persistentState == PersistentState.Modified) {
            this._persistentState = PersistentState.Modified;
            if (!this._changedMembers) {
                this._changedMembers = [];
            }
            if (this._changedMembers.indexOf(memberId) < 0) {
                this._changedMembers.push(memberId);
            }
        }

        super.OnPropertyChanged(memberId);
    }

    WriteTo(bs: IOutputStream) {
        bs.WriteByte(this._persistentState);

        let changesCount = this._changedMembers?.length ?? 0;
        bs.WriteVariant(changesCount);
        for (let i = 0; i < changesCount; i++) {
            bs.WriteShort(this._changedMembers[i]);
        }
    }

    ReadFrom(bs: IInputStream) {
        this._persistentState = bs.ReadByte();

        let changesCount = bs.ReadVariant();
        if (changesCount > 0) {
            this._changedMembers = [];
            for (let i = 0; i < changesCount; i++) {
                this._changedMembers.push(bs.ReadShort());
            }
        }
    }
}
