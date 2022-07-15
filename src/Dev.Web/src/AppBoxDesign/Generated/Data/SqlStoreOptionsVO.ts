import * as AppBoxCore from '@/AppBoxCore'
import * as System from '@/System'

export class SqlStoreOptionsVO {
    #StoreModelId: any = 0n;
    public get StoreModelId() {
        return this.#StoreModelId;
    }

    private set StoreModelId(value) {
        this.#StoreModelId = value;
    }

    #PrimaryKeys: System.IList<AppBoxCore.FieldWithOrder>;
    public get PrimaryKeys() {
        return this.#PrimaryKeys;
    }

    private set PrimaryKeys(value) {
        this.#PrimaryKeys = value;
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        this.StoreModelId = rs.ReadLong();
        let pkCount = rs.ReadVariant();
        this.PrimaryKeys = new System.List<AppBoxCore.FieldWithOrder>();
        if (pkCount > 0) {
            for (let i = 0; i < pkCount; i++) {
                let pk = new AppBoxCore.FieldWithOrder();
                pk.ReadFrom(rs);
                this.PrimaryKeys.Add((pk).Clone());
            }
        }
    }

    public Init(props: Partial<SqlStoreOptionsVO>): SqlStoreOptionsVO {
        Object.assign(this, props);
        return this;
    }

}