import * as System from '@/System'
import * as AppBoxCore from '@/AppBoxCore'

export class ReferenceVO implements AppBoxCore.IBinSerializable {
    #ModelId!: string;
    public get ModelId() {
        return this.#ModelId;
    }

    private set ModelId(value) {
        this.#ModelId = value;
    }

    #ModelName!: string;
    public get ModelName() {
        return this.#ModelName;
    }

    private set ModelName(value) {
        this.#ModelName = value;
    }

    #Location!: string;
    public get Location() {
        return this.#Location;
    }

    private set Location(value) {
        this.#Location = value;
    }

    #Offset: number = -1;
    public get Offset() {
        return this.#Offset;
    }

    private set Offset(value) {
        this.#Offset = value;
    }

    #Length: number = -1;
    public get Length() {
        return this.#Length;
    }

    private set Length(value) {
        this.#Length = value;
    }

    #TargetType: number = -1;
    public get TargetType() {
        return this.#TargetType;
    }

    private set TargetType(value) {
        this.#TargetType = value;
    }

    public WriteTo(ws: AppBoxCore.IOutputStream) {
        throw new System.NotSupportedException();
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        this.ModelId = rs.ReadString()!;
        this.ModelName = rs.ReadString()!;
        this.Location = rs.ReadString()!;
        this.Offset = rs.ReadVariant();
        this.Length = rs.ReadVariant();
        this.TargetType = rs.ReadVariant();
    }
}