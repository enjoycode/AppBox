import {PayloadType} from "./PayloadType";
import {IBinSerializable} from "./IBinSerializable";

export interface ITypeSerializer {
    readonly IsStruct: boolean;
    readonly Factory: () => IBinSerializable;
}

export class TypeSerializer {

    private static readonly _serializers: Map<PayloadType, ITypeSerializer>
        = new Map<PayloadType, ITypeSerializer>();

    public static RegisterKnownType(payloadType: PayloadType, isStruct: boolean, factory: () => IBinSerializable) {
        this._serializers.set(payloadType, {IsStruct: isStruct, Factory: factory });
    }
    
    public static GetSerializer(payloadType: PayloadType): ITypeSerializer | null {
        return this._serializers.get(payloadType);
    }
    
}