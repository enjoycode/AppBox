import {DateTime, Guid} from "@/System";

export interface IOutputStream {
    WriteByte(v: number): void;

    WriteShort(v: number): void;

    WriteInt(v: number): void;

    WriteDouble(v: number): void;

    WriteLong(v: bigint): void;

    WriteDateTime(v: DateTime): void;
    
    WriteGuid(v: Guid): void;

    WriteVariant(v: number): void;

    WriteString(v: string): void;

    /** 写入不带长度信息的ASCII或Base64字符串 */
    WriteAsciiString(v: string): void;

    // /** 将实体加入已序列化列表 */
    // AddToSerialized(obj: Entity): void;
}