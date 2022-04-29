import {IInputStream} from "./IInputStream"
import {IOutputStream} from "./IOutputStream";

export interface IBinSerializable {
    WriteTo(bs: IOutputStream): void;

    ReadFrom(bs: IInputStream): void;
}

export function IsInterfaceOfIBinSerializable(obj: any): obj is IBinSerializable {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_AppBoxCore_IBinSerializable' in obj.constructor;
}