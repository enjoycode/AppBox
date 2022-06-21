import {EntityFactory, IInputStream} from "./IInputStream";
import {PayloadType} from "./PayloadType";
import {TypeSerializer} from "./TypeSerializer";
import {Utf8Decode} from "./Utf8";
import {DateTime, Guid, NotImplementedException, NotSupportedException} from "@/System";
import {Entity} from "@/AppBoxCore";

export class BytesInputStream implements IInputStream {
    private pos = 0;
    private view: DataView;
    private readonly bytes: Uint8Array;
    private deserialized: any[] = null;
    EntityFactories: Map<bigint, EntityFactory> | null;

    constructor(buffer: ArrayBuffer) {
        this.bytes = new Uint8Array(buffer);
        this.view = new DataView(buffer);
    }

    public Deserialize(): any {
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
            case PayloadType.Int64:
                return this.ReadLong();
            case PayloadType.JsonObject:
                return this.ReadJsonObject();
            case PayloadType.ObjectRef:
                return this.deserialized[this.ReadVariant()];
            case PayloadType.Entity:
                return this.DeserializeEntity(null);
            case PayloadType.Array:
                return this.ReadArray();
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

    public DeserializeEntity<T extends Entity>(creator?: () => T): T {
        let modelId = this.ReadLong();
        //从上下文获取实体工厂
        let f = creator ?? this.EntityFactories.get(modelId);
        let entity = f();
        this.AddToDeserialized(entity);
        entity.ReadFrom(this);
        return <T>entity;
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
        this.ensureRemaining(8);
        const value = this.view.getBigInt64(this.pos, true);
        this.pos += 8;
        return value;
    }

    public ReadDateTime(): DateTime {
        let ticks = this.ReadLong() - 621355968000000000n /*UnixEpoch ticks*/;
        let date = new Date();
        date.setTime(Number(ticks / 10000n));
        return new DateTime(date);
    }

    public ReadGuid(): Guid {
        this.ensureRemaining(16);
        let value = new Uint8Array(this.bytes.slice(this.pos, this.pos + 16));
        this.pos += 16;
        return new Guid(value);
    }

    public ReadEntityId(): string {
        throw new NotImplementedException();
        // this.ensureRemaining(16);
        // let base64 = Base64Encode(this.bytes.slice(this.pos, this.pos + 16), false);
        // this.pos += 16;
        // return base64;
    }

    public ReadBinary(): Uint8Array {
        let len = this.ReadVariant();
        this.ensureRemaining(len);
        let value = new Uint8Array(this.bytes.slice(this.pos, this.pos + len));
        this.pos += len;
        return value;
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

    private ReadList(): any[] {
        this.ReadByte(); //Element type always = Object
        let count = this.ReadVariant();
        let list = [];
        for (let i = 0; i < count; i++) {
            list.push(this.Deserialize());
        }
        return list;
    }

    private ReadArray(): any[] {
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
                    let item = this.Deserialize();
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