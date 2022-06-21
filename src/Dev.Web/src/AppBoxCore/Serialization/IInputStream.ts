import {Entity} from "@/AppBoxCore";
import {DateTime, Guid} from "@/System";

export type EntityFactory = () => Entity;

export interface IInputStream {
    /** 流内剩余字节数 */
    readonly Remaining: number;

    /** 实体工厂，反序列化时根据实体模型标识创建实例*/
    EntityFactories: Map<bigint, EntityFactory> | null;

    Deserialize(): any;

    ReadByte(): number;

    ReadShort(): number;

    ReadInt(): number;

    ReadLong(): bigint;

    ReadVariant(): number;

    ReadDateTime(): DateTime;
    
    ReadGuid(): Guid;

    ReadString(): string;

    ReadEntityId(): string; //TODO:暂转换为Base64

    ReadBinary(): Uint8Array;

    /** 添加已反序列化列表，用于解决实体循环引用 */
    //AddToDeserialized(obj: Entity): void;
}