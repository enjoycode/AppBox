import {IBinSerializable} from "@/AppBoxCore";
import {MessageType} from "./MessageType";

export interface IMessage extends IBinSerializable {
    get MessageType(): MessageType;
}