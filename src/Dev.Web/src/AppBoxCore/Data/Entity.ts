import {IBinSerializable, IInputStream, IOutputStream} from "@/AppBoxCore";
import {Event} from "@/System";

export abstract class Entity implements IBinSerializable {
    public abstract get ModelId(): bigint;

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

    //TODO: override OnPropertyChanged

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
