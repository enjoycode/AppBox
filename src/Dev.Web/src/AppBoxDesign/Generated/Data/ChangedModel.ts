import * as System from '@/System'
import * as AppBoxCore from '@/AppBoxCore'

export class ChangedModel implements AppBoxCore.IBinSerializable {
    public ModelType: string = "";
    public ModelId: string = "";

    public WriteTo(ws: AppBoxCore.IOutputStream) {
        throw new System.NotSupportedException();
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        this.ModelType = rs.ReadString()!;
        this.ModelId = rs.ReadString()!;
    }
}