import * as System from '@/System'
import * as AppBoxCore from '@/AppBoxCore'

export class ChangedModel implements AppBoxCore.IBinSerializable {
    #ModelType: string = "";
    public get ModelType() {
        return this.#ModelType;
    }

    private set ModelType(value) {
        this.#ModelType = value;
    }

    #ModelId: string = "";
    public get ModelId() {
        return this.#ModelId;
    }

    private set ModelId(value) {
        this.#ModelId = value;
    }

    public WriteTo(ws: AppBoxCore.IOutputStream) {
        throw new System.NotSupportedException();
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        this.ModelType = rs.ReadString()!;
        this.ModelId = rs.ReadString()!;
    }

    public Init(props: Partial<ChangedModel>): ChangedModel {
        Object.assign(this, props);
        return this;
    }
}
