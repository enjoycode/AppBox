import {IBinSerializable, IInputStream, IOutputStream} from "@/AppBoxCore";

export abstract class Entity implements IBinSerializable {
    public abstract get ModelId(): bigint;

    ReadFrom(bs: IInputStream): void {
    }

    WriteTo(bs: IOutputStream): void {
    }

}

export abstract class DbEntity extends Entity {

}