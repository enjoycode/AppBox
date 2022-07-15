import * as System from '@/System'
import * as AppBoxCore from '@/AppBoxCore'

export abstract class IndexModelVO implements AppBoxCore.IBinSerializable {
    #IndexId: number = 0;
    public get IndexId() {
        return this.#IndexId;
    }

    protected set IndexId(value) {
        this.#IndexId = value;
    }

    #Name!: string;
    public get Name() {
        return this.#Name;
    }

    protected set Name(value) {
        this.#Name = value;
    }

    #Unique: boolean = false;
    public get Unique() {
        return this.#Unique;
    }

    protected set Unique(value) {
        this.#Unique = value;
    }

    #Fields!: AppBoxCore.FieldWithOrder[];
    public get Fields() {
        return this.#Fields;
    }

    protected set Fields(value) {
        this.#Fields = value;
    }

    public WriteTo(ws: AppBoxCore.IOutputStream) {
        throw new System.NotSupportedException();
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        this.IndexId = rs.ReadByte();
        this.Name = rs.ReadString()!;
        this.Unique = rs.ReadBool();
        this.Fields = new Array<AppBoxCore.FieldWithOrder>(rs.ReadVariant()).fill(AppBoxCore.FieldWithOrder.Empty.Clone());
        for (let i = 0; i < this.Fields.length; i++) {
            this.Fields[i].ReadFrom(rs);
        }
    }
}

export class SqlIndexModelVO extends IndexModelVO {

    public Init(props: Partial<SqlIndexModelVO>): SqlIndexModelVO {
        Object.assign(this, props);
        return this;
    }
}