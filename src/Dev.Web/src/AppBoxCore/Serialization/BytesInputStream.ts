import {IInputStream} from "./IInputStream";
import {PayloadType} from "./PayloadType";
import {TypeSerializer} from "./TypeSerializer";
import {Utf8Decode} from "./Utf8";
import {NotImplementedException, NotSupportedException} from "@/System";

export class BytesInputStream implements IInputStream {
    private pos = 0;
    private view: DataView;
    private readonly bytes: Uint8Array;

    private deserialized: any[] = null;

    constructor(buffer: ArrayBuffer) {
        this.bytes = new Uint8Array(buffer);
        this.view = new DataView(buffer);
    }

    public async DeserializeAsync(): Promise<any> {
        const payloadType = this.ReadByte();
        switch (payloadType) {
            case PayloadType.Null:
                return null;
            case PayloadType.BooleanTrue:
                return true;
            case PayloadType.BooleanFalse:
                return false;
            case PayloadType.String:
                return this.ReadString();
            case PayloadType.Int32:
                return this.ReadInt();
            // case PayloadType.Int64:
            //     return this.ReadInt64();
            case PayloadType.JsonObject:
                return this.ReadJsonObject();
            case PayloadType.ObjectRef:
                return this.deserialized[this.ReadVariant()];
            // case PayloadType.EntityModelInfo:
            //     return EntityModelInfo.ReadFrom(this);
            // case PayloadType.Entity:
            //     return await Entity.ReadFrom(this);
            case PayloadType.Array:
                return await this.ReadArray();
            // case PayloadType.List:
            //     return await this.ReadList();
        }

        //查找已知类型创建实例(找不到抛异常)
        const serializer = TypeSerializer.GetSerializer(payloadType);
        if (serializer == null) throw new Error("Can't find type serializer: " + payloadType);
        let obj = serializer.Factory();
        //加入已反序列化列表
        if (!serializer.IsStruct) {
            this.AddToDeserialized(obj);
        }
        obj.ReadFrom(this);
        return obj;
    }

    private AddToDeserialized(obj: any) {
        if (!this.deserialized) {
            this.deserialized = [];
        }
        this.deserialized.push(obj);
    }

    /** 剩余字节数 */
    public get Remaining(): number {
        return this.view.byteLength - this.pos;
    }

    private ensureRemaining(size: number) {
        if (this.view.byteLength - this.pos < size) {
            throw new RangeError('Has no data.');
        }
    }

    public ReadByte(): number {
        this.ensureRemaining(1);
        const value = this.view.getUint8(this.pos);
        this.pos++;
        return value;
    }

    public ReadBool(): boolean {
        return this.ReadByte() === PayloadType.BooleanTrue;
    }

    public ReadShort(): number {
        this.ensureRemaining(2);
        const value = this.view.getInt16(this.pos, true);
        this.pos += 2;
        return value;
    }

    public ReadInt(): number {
        this.ensureRemaining(4);
        const value = this.view.getInt32(this.pos, true);
        this.pos += 4;
        return value;
    }

    public ReadLong(): bigint {
        throw new NotImplementedException();
        // this.ensureRemaining(8);
        // const v1 = this.view.getInt32(this.pos, true);
        // const v2 = this.view.getInt32(this.pos + 4, true);
        // this.pos += 8;
        // return new Long(v1, v2);
    }

    public ReadDateTime(): Date {
        throw new NotImplementedException();
        //TODO:寻找更好的方法
        // let long = this.ReadInt64();
        // let date = new Date();
        // date.setTime(Number.parseInt(long.toString()));
        // return date;
    }

    public ReadEntityId(): string {
        throw new NotImplementedException();
        // this.ensureRemaining(16);
        // let base64 = Base64Encode(this.bytes.slice(this.pos, this.pos + 16), false);
        // this.pos += 16;
        // return base64;
    }

    public ReadBinary(): Uint8Array {
        throw new NotImplementedException();
        // let len = this.ReadVariant();
        // this.ensureRemaining(len);
        // let base64 = Base64Encode(this.bytes.slice(this.pos, this.pos + len), false);
        // this.pos += len;
        // return base64;
    }

    private ReadJsonObject(): any {
        let jsonString = Utf8Decode(this, -1);
        return JSON.parse(jsonString); //TODO: 优化直接从Stream转换
    }

    public ReadVariant(): number {
        let data = this.ReadNativeVariant();
        return -(data & 1) ^ ((data >> 1) & 0x7fffffff);
    }

    private ReadNativeVariant(): number {
        let data = this.ReadByte();
        if ((data & 0x80) == 0) {
            return data;
        }
        data &= 0x7F;
        let num2 = this.ReadByte();
        data |= (num2 & 0x7F) << 7;
        if ((num2 & 0x80) == 0) {
            return data;
        }
        num2 = this.ReadByte();
        data |= (num2 & 0x7F) << 14;
        if ((num2 & 0x80) == 0) {
            return data;
        }
        num2 = this.ReadByte();
        data |= (num2 & 0x7F) << 0x15;
        if ((num2 & 0x80) == 0) {
            return data;
        }
        num2 = this.ReadByte();
        data |= num2 << 0x1C;
        if ((num2 & 240) != 0) {
            throw new Error('out of range');
        }
        return data;
    }

    public ReadString(): string | null {
        let chars = this.ReadVariant();
        if (chars < 0) return null;
        if (chars === 0) return '';
        return Utf8Decode(this, chars);
    }

    private async ReadList(): Promise<any[]> {
        this.ReadByte(); //Element type always = Object
        let count = this.ReadVariant();
        let list = [];
        for (let i = 0; i < count; i++) {
            list.push(await this.DeserializeAsync());
        }
        return list;
    }

    private async ReadArray(): Promise<any[]> {
        const elementType: PayloadType = this.ReadType();
        const count = this.ReadVariant();
        //TODO:根据elementType处理
        const serializer = TypeSerializer.GetSerializer(elementType);
        if (serializer) {
            let res = [];
            if (serializer.IsStruct) {
                for (let i = 0; i < count; i++) {
                    let item = serializer.Factory();
                    item.ReadFrom(this);
                    res.push(item);
                }
            } else {
                for (let i = 0; i < count; i++) {
                    let item = await this.DeserializeAsync();
                    res.push(item);
                }
            }
            return res;
        } else {
            throw new NotImplementedException("ReadArray elementType=" + elementType);
        }
    }

    private ReadType(): PayloadType {
        //只支持已知类型
        const typeFlag = this.ReadByte();
        if (typeFlag === 2) {
            return PayloadType.Object;
        } else if (typeFlag === 0) {
            const payloadType: PayloadType = this.ReadByte();
            //TODO:继续读Array或List等类型的附加类型
            return payloadType;
        } else {
            throw new NotSupportedException("不支持的TypeFlag");
        }
    }
}