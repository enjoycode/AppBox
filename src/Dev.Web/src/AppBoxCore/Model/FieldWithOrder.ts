import {IBinSerializable, IInputStream, IOutputStream} from "@/AppBoxCore";

export class FieldWithOrder implements IBinSerializable {
    private _memberId: number;
    private _orderByDesc: boolean;

    public get MemberId(): number {
        return this._memberId;
    }

    public get OrderByDesc(): boolean {
        return this._orderByDesc;
    }

    public constructor(memberId: number, orderByDesc: boolean = false) {
        this._memberId = memberId;
        this._orderByDesc = orderByDesc;
    }

    WriteTo(bs: IOutputStream): void {
        bs.WriteShort(this.MemberId);
        bs.WriteBool(this.OrderByDesc)
    }

    ReadFrom(bs: IInputStream): void {
        this._memberId = bs.ReadShort();
        this._orderByDesc = bs.ReadBool();
    }
}