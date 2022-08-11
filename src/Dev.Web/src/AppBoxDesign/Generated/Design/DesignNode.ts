import * as AppBoxCore from '@/AppBoxCore'
import * as System from '@/System'
import * as AppBoxDesign from '@/AppBoxDesign'

export abstract class DesignNode {
    public abstract get Type(): AppBoxDesign.DesignNodeType ;

    public get Children(): Nullable<System.IList<DesignNode>> {
        return null;
    }

    #Id!: string;
    public get Id() {
        return this.#Id;
    }

    protected set Id(value) {
        this.#Id = value;
    }

    #Label!: string;
    public get Label() {
        return this.#Label;
    }

    protected set Label(value) {
        this.#Label = value;
    }

    public Designer: Nullable<AppBoxDesign.IDesigner>;

    public toString(): string {
        return this.Label;
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        this.Id = rs.ReadString()!;
        this.Label = rs.ReadString()!;
    }
}

export class DataStoreRootNode extends DesignNode {
    public get Type(): AppBoxDesign.DesignNodeType {
        return AppBoxDesign.DesignNodeType.DataStoreRootNode;
    }

    private readonly _children: System.List<DesignNode> = new System.List<DesignNode>();

    public get Children(): Nullable<System.IList<DesignNode>> {
        return this._children;
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        super.ReadFrom(rs);

        let count = rs.ReadVariant();
        for (let i = 0; i < count; i++) {
            let dataStoreNode = new DataStoreNode();
            dataStoreNode.ReadFrom(rs);
            this._children.Add(dataStoreNode);
        }
    }

    public Init(props: Partial<DataStoreRootNode>): DataStoreRootNode {
        Object.assign(this, props);
        return this;
    }
}

export class DataStoreNode extends DesignNode {
    public static readonly None: DataStoreNode = new DataStoreNode().Init(
        {Id: '', Label: "None"});

    public get Type(): AppBoxDesign.DesignNodeType {
        return AppBoxDesign.DesignNodeType.DataStoreNode;
    }

    public Init(props: Partial<DataStoreNode>): DataStoreNode {
        Object.assign(this, props);
        return this;
    }
}

export class ApplicationRootNode extends DesignNode {
    public get Type(): AppBoxDesign.DesignNodeType {
        return AppBoxDesign.DesignNodeType.ApplicationRoot;
    }

    private readonly _children: System.List<DesignNode> = new System.List<DesignNode>();

    public get Children(): Nullable<System.IList<DesignNode>> {
        return this._children;
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        super.ReadFrom(rs);
        let count = rs.ReadVariant();
        for (let i = 0; i < count; i++) {
            let appNode = new ApplicationNode();
            appNode.ReadFrom(rs);
            this._children.Add(appNode);
        }
    }

    public Init(props: Partial<ApplicationRootNode>): ApplicationRootNode {
        Object.assign(this, props);
        return this;
    }
}

export class ApplicationNode extends DesignNode {
    public get Type(): AppBoxDesign.DesignNodeType {
        return AppBoxDesign.DesignNodeType.ApplicationNode;
    }

    private readonly _children: System.List<DesignNode> = new System.List<DesignNode>();

    public get Children(): Nullable<System.IList<DesignNode>> {
        return this._children;
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        super.ReadFrom(rs);
        let count = rs.ReadVariant();
        for (let i = 0; i < count; i++) {
            let modelRootNode = new ModelRootNode();
            modelRootNode.ReadFrom(rs);
            this._children.Add(modelRootNode);
        }
    }

    public Init(props: Partial<ApplicationNode>): ApplicationNode {
        Object.assign(this, props);
        return this;
    }
}

export class ModelRootNode extends DesignNode {
    public get Type(): AppBoxDesign.DesignNodeType {
        return AppBoxDesign.DesignNodeType.ModelRootNode;
    }

    private readonly _children: System.List<DesignNode> = new System.List<DesignNode>();

    public get Children(): Nullable<System.IList<DesignNode>> {
        return this._children;
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        super.ReadFrom(rs);

        let count = rs.ReadVariant();
        for (let i = 0; i < count; i++) {
            let nodeType = <AppBoxDesign.DesignNodeType><unknown>rs.ReadByte();
            let node: DesignNode;
            if (nodeType == AppBoxDesign.DesignNodeType.ModelNode)
                node = new ModelNode();
            else if (nodeType == AppBoxDesign.DesignNodeType.FolderNode)
                node = new FolderNode();
            else
                throw new System.NotSupportedException();

            node.ReadFrom(rs);
            this._children.Add(node);
        }
    }

    public Init(props: Partial<ModelRootNode>): ModelRootNode {
        Object.assign(this, props);
        return this;
    }
}

export class FolderNode extends DesignNode {
    public get Type(): AppBoxDesign.DesignNodeType {
        return AppBoxDesign.DesignNodeType.FolderNode;
    }

    private readonly _children: System.List<DesignNode> = new System.List<DesignNode>();

    public get Children(): Nullable<System.IList<DesignNode>> {
        return this._children;
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        super.ReadFrom(rs);

        let count = rs.ReadVariant();
        for (let i = 0; i < count; i++) {
            let nodeType = <AppBoxDesign.DesignNodeType><unknown>rs.ReadByte();
            let node: DesignNode;
            if (nodeType == AppBoxDesign.DesignNodeType.ModelNode)
                node = new ModelNode();
            else if (nodeType == AppBoxDesign.DesignNodeType.FolderNode)
                node = new FolderNode();
            else
                throw new System.NotSupportedException();

            node.ReadFrom(rs);
            this._children.Add(node);
        }
    }

    public Init(props: Partial<FolderNode>): FolderNode {
        Object.assign(this, props);
        return this;
    }
}

export class ModelNode extends DesignNode {
    public get Type(): AppBoxDesign.DesignNodeType {
        return AppBoxDesign.DesignNodeType.ModelNode;
    }

    #ModelType: AppBoxCore.ModelType = 0;
    public get ModelType() {
        return this.#ModelType;
    }

    private set ModelType(value) {
        this.#ModelType = value;
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        super.ReadFrom(rs);
        this.ModelType = <AppBoxCore.ModelType><unknown>rs.ReadByte();
    }

    public Init(props: Partial<ModelNode>): ModelNode {
        Object.assign(this, props);
        return this;
    }
}
