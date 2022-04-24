import {IBinSerializable} from "./IBinSerializable";
import {MessageType} from "./MessageType";

export interface IMessage extends IBinSerializable {
    get MessageType(): MessageType;
}