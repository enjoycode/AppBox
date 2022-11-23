import * as AppBoxCore from '@/AppBoxCore'
import * as PixUI from '@/PixUI'
import * as System from '@/System'
import * as AppBoxDesign from '@/AppBoxDesign'

export abstract class DesignNodeVO {
    public abstract get Type(): AppBoxDesign.DesignNodeType ;

    public get Children(): Nullable<System.IList<DesignNodeVO>> {
        return null;
    }

    #Id!: string;
    public get Id() {
        return this.#Id;
    }

    protected set Id(value) {
        this.#Id = value;
    }

    public readonly Label: PixUI.State<string> = PixUI.State.op_Implicit_From("None");

    public Designer: Nullable<AppBoxDesign.IDesigner>;

    public toString(): string {
        return this.Label.Value;
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        this.Id = rs.ReadString()!;
        this.Label.Value = rs.ReadString()!;
    }
}

export class DataStoreRootNodeVO extends DesignNodeVO {
    public get Type(): AppBoxDesign.DesignNodeType {
        return AppBoxDesign.DesignNodeType.DataStoreRootNode;
    }

    private readonly _children: System.List<DesignNodeVO> = new System.List<DesignNodeVO>();

    public get Children(): Nullable<System.IList<DesignNodeVO>> {
        return this._children;
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        super.ReadFrom(rs);

        let count = rs.ReadVariant();
        for (let i = 0; i < count; i++) {
            let dataStoreNode = new DataStoreNodeVO();
            dataStoreNode.ReadFrom(rs);
            this._children.Add(dataStoreNode);
        }
    }
}

export class DataStoreNodeVO extends DesignNodeVO {
    public static readonly None: DataStoreNodeVO = new DataStoreNodeVO().Init(
        {Id: ''});

    public get Type(): AppBoxDesign.DesignNodeType {
        return AppBoxDesign.DesignNodeType.DataStoreNode;
    }
}

export class ApplicationRootNodeVO extends DesignNodeVO {
    public get Type(): AppBoxDesign.DesignNodeType {
        return AppBoxDesign.DesignNodeType.ApplicationRoot;
    }

    private readonly _children: System.List<DesignNodeVO> = new System.List<DesignNodeVO>();

    public get Children(): Nullable<System.IList<DesignNodeVO>> {
        return this._children;
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        super.ReadFrom(rs);
        let count = rs.ReadVariant();
        for (let i = 0; i < count; i++) {
            let appNode = new ApplicationNodeVO();
            appNode.ReadFrom(rs);
            this._children.Add(appNode);
        }
    }
}

export class ApplicationNodeVO extends DesignNodeVO {
    public get Type(): AppBoxDesign.DesignNodeType {
        return AppBoxDesign.DesignNodeType.ApplicationNode;
    }

    private readonly _children: System.List<DesignNodeVO> = new System.List<DesignNodeVO>();

    public get Children(): Nullable<System.IList<DesignNodeVO>> {
        return this._children;
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        super.ReadFrom(rs);
        let count = rs.ReadVariant();
        for (let i = 0; i < count; i++) {
            let modelRootNode = new ModelRootNodeVO(this);
            modelRootNode.ReadFrom(rs);
            this._children.Add(modelRootNode);
        }
    }
}

export class ModelRootNodeVO extends DesignNodeVO {
    public constructor(applicationNode: ApplicationNodeVO) {
        super();
        this.ApplicationNode = applicationNode;
    }

    public readonly ApplicationNode: ApplicationNodeVO;

    public get Type(): AppBoxDesign.DesignNodeType {
        return AppBoxDesign.DesignNodeType.ModelRootNode;
    }

    private readonly _children: System.List<DesignNodeVO> = new System.List<DesignNodeVO>();

    public get Children(): Nullable<System.IList<DesignNodeVO>> {
        return this._children;
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        super.ReadFrom(rs);

        let count = rs.ReadVariant();
        for (let i = 0; i < count; i++) {
            let nodeType = <AppBoxDesign.DesignNodeType><unknown>rs.ReadByte();
            let node: DesignNodeVO;
            if (nodeType == AppBoxDesign.DesignNodeType.ModelNode)
                node = new ModelNodeVO(this);
            else if (nodeType == AppBoxDesign.DesignNodeType.FolderNode)
                node = new FolderNodeVO(this);
            else
                throw new System.NotSupportedException();

            node.ReadFrom(rs);
            this._children.Add(node);
        }
    }
}

export class FolderNodeVO extends DesignNodeVO {
    public constructor(modelRootNode: ModelRootNodeVO) {
        super();
        this.ModelRootNode = modelRootNode;
    }

    public readonly ModelRootNode: ModelRootNodeVO;

    public get Type(): AppBoxDesign.DesignNodeType {
        return AppBoxDesign.DesignNodeType.FolderNode;
    }

    private readonly _children: System.List<DesignNodeVO> = new System.List<DesignNodeVO>();

    public get Children(): Nullable<System.IList<DesignNodeVO>> {
        return this._children;
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        super.ReadFrom(rs);

        let count = rs.ReadVariant();
        for (let i = 0; i < count; i++) {
            let nodeType = <AppBoxDesign.DesignNodeType><unknown>rs.ReadByte();
            let node: DesignNodeVO;
            if (nodeType == AppBoxDesign.DesignNodeType.ModelNode)
                node = new ModelNodeVO(this.ModelRootNode);
            else if (nodeType == AppBoxDesign.DesignNodeType.FolderNode)
                node = new FolderNodeVO(this.ModelRootNode);
            else
                throw new System.NotSupportedException();

            node.ReadFrom(rs);
            this._children.Add(node);
        }
    }
}

export class ModelNodeVO extends DesignNodeVO {
    public constructor(modelRootNode: ModelRootNodeVO) {
        super();
        this.ModelRootNode = modelRootNode;
    }

    public readonly ModelRootNode: ModelRootNodeVO;

    public get AppName(): string {
        return this.ModelRootNode.ApplicationNode.Label.Value;
    }

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
}
