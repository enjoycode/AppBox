import * as AppBoxDesign from '@/AppBoxDesign'
import * as System from '@/System'
import * as AppBoxCore from '@/AppBoxCore'

export abstract class EntityMemberVO implements AppBoxCore.IBinSerializable {
    public abstract get Type(): AppBoxCore.EntityMemberType ;

    #Id: number = 0;
    public get Id() {
        return this.#Id;
    }

    private set Id(value) {
        this.#Id = value;
    }

    public Name!: string;
    public AllowNull: boolean = false;
    public Comment: Nullable<string>;

    public get IsForeignKeyMember(): boolean {
        return this.Type == AppBoxCore.EntityMemberType.EntityField
            && (<EntityFieldVO><unknown>this).IsForeignKey;
    }

    public toString(): string {
        return this.Name;
    }

    public WriteTo(ws: AppBoxCore.IOutputStream) {
        throw new System.NotSupportedException();
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        this.Id = rs.ReadShort();
        this.Name = rs.ReadString()!;
        this.AllowNull = rs.ReadBool();
        this.Comment = rs.ReadString();
    }

}

export class EntityFieldVO extends EntityMemberVO {
    public get Type(): AppBoxCore.EntityMemberType {
        return AppBoxCore.EntityMemberType.EntityField;
    }

    #FieldType: AppBoxCore.EntityFieldType = 0;
    public get FieldType() {
        return this.#FieldType;
    }

    private set FieldType(value) {
        this.#FieldType = value;
    }

    #IsForeignKey: boolean = false;
    public get IsForeignKey() {
        return this.#IsForeignKey;
    }

    private set IsForeignKey(value) {
        this.#IsForeignKey = value;
    }

    public EnumModelId: Nullable<any>;
    public Length: number = 0;
    public Decimals: number = 0;

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        super.ReadFrom(rs);
        this.FieldType = <AppBoxCore.EntityFieldType><unknown>rs.ReadByte();
        this.IsForeignKey = rs.ReadBool();
        if (this.FieldType == AppBoxCore.EntityFieldType.Enum)
            this.EnumModelId = rs.ReadLong();
        this.Length = rs.ReadVariant();
        this.Decimals = rs.ReadVariant();
    }

    public Init(props: Partial<EntityFieldVO>): EntityFieldVO {
        Object.assign(this, props);
        return this;
    }

}

export class EntityRefVO extends EntityMemberVO {
    public get Type(): AppBoxCore.EntityMemberType {
        return AppBoxCore.EntityMemberType.EntityRef;
    }

    public readonly RefModelIds: System.IList<any> = new System.List<any>();
    #FKMemberIds!: Int16Array;
    public get FKMemberIds() {
        return this.#FKMemberIds;
    }

    private set FKMemberIds(value) {
        this.#FKMemberIds = value;
    }

    public IsReverse: boolean = false;
    public IsAggregationRef: boolean = false;
    public IsForeignKeyConstraint: boolean = false;

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        super.ReadFrom(rs);
        this.IsReverse = rs.ReadBool();
        this.IsAggregationRef = rs.ReadBool();
        this.IsForeignKeyConstraint = rs.ReadBool();
        let count = rs.ReadVariant();
        for (let i = 0; i < count; i++) {
            this.RefModelIds.Add(rs.ReadLong());
        }

        count = rs.ReadVariant();
        this.FKMemberIds = new Int16Array(count);
        for (let i = 0; i < count; i++) {
            this.FKMemberIds[i] = rs.ReadShort();
        }
    }

    public Init(props: Partial<EntityRefVO>): EntityRefVO {
        Object.assign(this, props);
        return this;
    }

}

export class EntitySetVO extends EntityMemberVO {
    public get Type(): AppBoxCore.EntityMemberType {
        return AppBoxCore.EntityMemberType.EntitySet;
    }

    public RefModelId: any = 0n;
    public RefMemberId: number = 0;

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        super.ReadFrom(rs);
        this.RefModelId = rs.ReadLong();
        this.RefMemberId = rs.ReadShort();
    }

    public Init(props: Partial<EntitySetVO>): EntitySetVO {
        Object.assign(this, props);
        return this;
    }
}

export class EntityModelVO implements AppBoxCore.IBinSerializable {
    public IsNew: boolean = false;
    public readonly Members: System.IList<EntityMemberVO> = new System.List<EntityMemberVO>();
    public DataStoreKind: AppBoxCore.DataStoreKind = 0;

    private _storeOptions: Nullable<any>;

    public get SqlStoreOptions(): AppBoxDesign.SqlStoreOptionsVO {
        return <AppBoxDesign.SqlStoreOptionsVO><unknown>this._storeOptions!;
    }

    public WriteTo(ws: AppBoxCore.IOutputStream) {
        throw new System.NotSupportedException();
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        this.IsNew = rs.ReadBool();
        this.DataStoreKind = <AppBoxCore.DataStoreKind><unknown>rs.ReadByte();
        //store options
        if (this.DataStoreKind == AppBoxCore.DataStoreKind.Sql) {
            let sqlStoreOptions = new AppBoxDesign.SqlStoreOptionsVO();
            sqlStoreOptions.ReadFrom(rs);
            this._storeOptions = sqlStoreOptions;
        }

        //members
        let count = rs.ReadVariant();
        for (let i = 0; i < count; i++) {
            let type = <AppBoxCore.EntityMemberType><unknown>rs.ReadByte();
            let member: EntityMemberVO;
            switch (type) {
                case AppBoxCore.EntityMemberType.EntityField:
                    member = new EntityFieldVO();
                    break;
                case AppBoxCore.EntityMemberType.EntityRef:
                    member = new EntityRefVO();
                    break;
                case AppBoxCore.EntityMemberType.EntitySet:
                    member = new EntitySetVO();
                    break;
                default:
                    throw new System.NotImplementedException();
            }

            member.ReadFrom(rs);
            this.Members.Add(member);
        }
    }

    public Init(props: Partial<EntityModelVO>): EntityModelVO {
        Object.assign(this, props);
        return this;
    }
}
