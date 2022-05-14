import {IBinSerializable} from "../../AppBoxCore/Serialization/IBinSerializable";
import {MessageType} from "./MessageType";

export interface IMessage extends IBinSerializable {
    get MessageType(): MessageType;
}