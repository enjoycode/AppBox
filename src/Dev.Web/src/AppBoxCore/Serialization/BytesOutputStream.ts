import {IOutputStream} from "./IOutputStream";
import {PayloadType} from "./PayloadType";
import {Utf8Encode} from "./Utf8";
import {DateTime, Guid, List} from "@/System";
import {Entity} from "@/AppBoxCore";

export class BytesOutputStream implements IOutputStream {
    private pos = 0;
    private view = new DataView(new ArrayBuffer(128));
    private bytes = new Uint8Array(this.view.buffer);
    private _serializedList: any[] | null = null;

    public get Bytes(): Uint8Array {
        return this.bytes.subarray(0, this.pos);
    }

    private ensureSizeToWrite(sizeToWrite: number) {
        const requiredSize = this.pos + sizeToWrite;

        if (this.view.byteLength < requiredSize) {
            this.resizeBuffer(requiredSize * 2);
        }
    }

    private resizeBuffer(newSize: number) {
        const newBuffer = new ArrayBuffer(newSize);
        const newBytes = new Uint8Array(newBuffer);
        const newView = new DataView(newBuffer);

        newBytes.set(this.bytes);

        this.view = newView;
        this.bytes = newBytes;
    }

    public Skip(size: number) {
        this.pos += size;
    }

    //region ====SerializeXXX====
    public Serialize(obj: any) {
        if (obj == null) {
            this.WriteByte(PayloadType.Null);
        } else if (typeof obj === 'boolean') {
            this.WriteByte(obj === false ? PayloadType.BooleanFalse : PayloadType.BooleanTrue);
        } else if (typeof obj === 'number') {
            this.SerializeNumber(obj);
        } else if (typeof obj === 'string') {
            this.WriteByte(PayloadType.String);
            this.WriteString(obj);
        } else if (typeof obj === 'bigint') {
            this.WriteByte(PayloadType.Int64);
            this.WriteLong(obj);
        } else if (obj instanceof DateTime) {
            this.WriteByte(PayloadType.DateTime);
            this.WriteDateTime(obj);
        } else if (obj instanceof Guid) {
            this.WriteByte(PayloadType.Guid);
            this.WriteGuid(obj);
        } else if (obj instanceof Entity) {
            this.SerializeEntity(obj);
        } else if (obj instanceof List) {
            this.SerializeList(obj);
        } else if (Array.isArray(obj)) {
            this.SerializeArray(obj);
        } else {
            throw new Error('未实现的序列化');
        }
        //TODO: for Uint8Array and other
    }

    private SerializeEntity(obj: Entity | null) {
        if (!obj) {
            this.WriteByte(PayloadType.Null);
            return;
        }

        //判断是否已经序列化过(解决实体循环引用)
        if (this.CheckSerialized(obj)) return;

        this.AddToSerialized(obj);

        this.WriteByte(PayloadType.Entity);
        this.WriteLong(obj.ModelId);
        obj.WriteTo(this);
    }

    private SerializeList(obj: List<any>) {
        this.WriteByte(PayloadType.List);
        this.WriteByte(2); //ElementType always = Object
        this.WriteVariant(obj.length);
        for (let i = 0; i < obj.length; i++) {
            this.Serialize(obj[i]);
        }
    }
    
    private SerializeArray(obj: Array<any>) {
        this.WriteByte(PayloadType.Array);
        this.WriteByte(2); //ElementType always = Object
        this.WriteVariant(obj.length);
        for (let i = 0; i < obj.length; i++) {
            this.Serialize(obj[i]);
        }
    }

    private SerializeNumber(num: number) {
        if (Number.isSafeInteger(num)) {
            //TODO: 暂全部按有符号处理以适应Java, 且暂只分int32, int64
            if (num >= -2147483648 && num <= 2147483647) {
                this.WriteByte(PayloadType.Int32);
                this.WriteInt(num);
            } else {
                this.WriteByte(PayloadType.Int64);
                this.WriteLong(BigInt(num));
            }
        } else {
            //TODO: 暂按Double处理
            this.WriteByte(PayloadType.Double);
            this.WriteDouble(num);
        }
    }

    //endregion

    //region ====WriteXXX====

    public WriteByte(v: number): void {
        this.ensureSizeToWrite(1);
        this.view.setUint8(this.pos, v);
        this.pos++;
    }

    // public WriteInt8(v: number): void {
    //     this.ensureSizeToWrite(1);
    //     this.view.setInt8(this.pos, v);
    //     this.pos++;
    // }

    public WriteBool(v: boolean): void {
        this.WriteByte(v === true ? PayloadType.BooleanTrue : PayloadType.BooleanFalse);
    }

    public WriteShort(v: number): void {
        this.ensureSizeToWrite(2);
        this.view.setInt16(this.pos, v, true);
        this.pos += 2;
    }

    public WriteInt(v: number): void {
        this.ensureSizeToWrite(4);
        this.view.setInt32(this.pos, v, true);
        this.pos += 4;
    }

    public WriteLong(v: bigint): void {
        this.ensureSizeToWrite(8);
        this.view.setBigInt64(this.pos, v, true)
        this.pos += 8;
    }

    public WriteDouble(v: number): void {
        this.ensureSizeToWrite(8);
        this.view.setFloat64(this.pos, v, true);
        this.pos += 8;
    }

    public WriteDateTime(v: DateTime) {
        this.WriteLong(v.Ticks);
    }

    public WriteGuid(v: Guid) {
        this.ensureSizeToWrite(16);
        this.bytes.set(v.Value, this.pos);
        this.pos += 16;
    }

    public WriteString(v?: string): void {
        if (!v) {
            this.WriteVariant(-1);
        } else {
            this.WriteVariant(v.length);
            if (v.length > 0) {
                Utf8Encode(v, this);
            }
        }
    }

    public WriteAsciiString(v: string) {
        if (!v) {
            this.WriteByte(PayloadType.Null);
        } else {
            for (let i = 0; i < v.length; i++) {
                this.WriteByte(v.charCodeAt(i));
            }
        }
    }

    public WriteVariant(v: number): void {
        if (!Number.isInteger(v)) {
            throw new Error('must be Integer');
        }

        v = (v << 1) ^ (v >> 0x1F);

        let temp = 0;
        do {
            temp = (v & 0x7F) | 0x80;
            if ((v >>= 7) != 0) {
                this.WriteByte(temp);
            } else {
                temp = temp & 0x7F;
                this.WriteByte(temp);
                break;
            }
        } while (true);
    }

    //endregion

    //region ====循环引用处理====

    private GetSerializedIndex(obj: any): number {
        if (!this._serializedList || this._serializedList.length == 0) {
            return -1;
        }
        for (let i = this._serializedList.length - 1; i >= 0; i--) {
            if (this._serializedList[i] === obj) {
                return i;
            }
        }
        return -1;
    }

    /**检查是否已经序列化过，是则写入ObjectRef信息*/
    private CheckSerialized(obj: any): boolean {
        let index = this.GetSerializedIndex(obj);
        if (index === -1) {
            return false;
        }

        this.WriteByte(PayloadType.ObjectRef);
        this.WriteVariant(index);
        return true;
    }

    private AddToSerialized(obj: any) {
        if (!this._serializedList) {
            this._serializedList = [];
        }
        this._serializedList.push(obj);
    }

    //endregion

}