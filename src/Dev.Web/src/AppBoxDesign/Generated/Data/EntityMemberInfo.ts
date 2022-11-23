import * as System from '@/System'
import * as AppBoxCore from '@/AppBoxCore'

export class EntityMemberInfo implements AppBoxCore.IBinSerializable {
    public AppName!: string;
    public ModelName!: string;
    public MemberName!: string;
    public ModelId!: string;
    public MemberId: number = 0;

    public toString(): string {
        return `${this.AppName}.${this.ModelName}.${this.MemberName}`;
    }

    public WriteTo(ws: AppBoxCore.IOutputStream) {
        throw new System.NotSupportedException();
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        this.AppName = rs.ReadString()!;
        this.ModelName = rs.ReadString()!;
        this.MemberName = rs.ReadString()!;
        this.ModelId = rs.ReadString()!;
        this.MemberId = rs.ReadShort();
    }
}