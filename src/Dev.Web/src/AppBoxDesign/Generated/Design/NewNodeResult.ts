import * as System from '@/System'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as AppBoxCore from '@/AppBoxCore'

export class NewNodeResult implements AppBoxCore.IBinSerializable {
    #ParentNodeType: AppBoxDesign.DesignNodeType = 0;
    public get ParentNodeType() {
        return this.#ParentNodeType;
    }

    private set ParentNodeType(value) {
        this.#ParentNodeType = value;
    }

    #ParentNodeId: string = "";
    public get ParentNodeId() {
        return this.#ParentNodeId;
    }

    private set ParentNodeId(value) {
        this.#ParentNodeId = value;
    }

    #NewNode: AppBoxDesign.DesignNode;
    public get NewNode() {
        return this.#NewNode;
    }

    private set NewNode(value) {
        this.#NewNode = value;
    }

    #RootNodeId: Nullable<string>;
    public get RootNodeId() {
        return this.#RootNodeId;
    }

    private set RootNodeId(value) {
        this.#RootNodeId = value;
    }

    #InsertIndex: number = 0;
    public get InsertIndex() {
        return this.#InsertIndex;
    }

    private set InsertIndex(value) {
        this.#InsertIndex = value;
    }

    public WriteTo(ws: AppBoxCore.IOutputStream) {
        throw new System.NotSupportedException();
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        this.ParentNodeType = <AppBoxDesign.DesignNodeType><unknown>rs.ReadByte();
        this.ParentNodeId = rs.ReadString()!;
        this.RootNodeId = rs.ReadString();
        this.InsertIndex = rs.ReadInt();

        let newNodeType = <AppBoxDesign.DesignNodeType><unknown>rs.ReadByte();
        switch (newNodeType) {
            case AppBoxDesign.DesignNodeType.FolderNode:
                this.NewNode = new AppBoxDesign.FolderNode();
                break;
            case AppBoxDesign.DesignNodeType.ModelNode:
                this.NewNode = new AppBoxDesign.ModelNode();
                break;
            case AppBoxDesign.DesignNodeType.DataStoreNode:
                this.NewNode = new AppBoxDesign.DataStoreNode();
                break;
            default:
                throw new System.NotSupportedException();
        }

        this.NewNode.ReadFrom(rs);
    }

    public Init(props: Partial<NewNodeResult>): NewNodeResult {
        Object.assign(this, props);
        return this;
    }
}
