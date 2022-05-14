export interface IInputStream {
    readonly Remaining: number;

    DeserializeAsync(): Promise<any>;

    ReadByte(): number;

    ReadInt16(): number;

    ReadInt32(): number;

    ReadInt64(): bigint;

    ReadVariant(): number;

    ReadDate(): Date;

    ReadString(): string;

    ReadEntityId(): string; //TODO:暂转换为Base64

    ReadBinary(): Uint8Array;

    /** 添加已反序列化列表，用于解决实体循环引用 */
    //AddToDeserialized(obj: Entity): void;
}