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

    public constructor();
    public constructor(memberId: number, orderByDesc?: boolean);
    public constructor(memberId?: number, orderByDesc?: boolean) {
        if (memberId != undefined) {
            this._memberId = memberId;
            this._orderByDesc = orderByDesc == undefined ? false : orderByDesc;
        }
    }

    public Clone(): FieldWithOrder {
        return new FieldWithOrder(this._memberId, this._orderByDesc);
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