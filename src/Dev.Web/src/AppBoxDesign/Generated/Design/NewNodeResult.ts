import * as System from '@/System'
import * as PixUI from '@/PixUI'
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

    #ParentNodeId!: string;
    public get ParentNodeId() {
        return this.#ParentNodeId;
    }

    private set ParentNodeId(value) {
        this.#ParentNodeId = value;
    }

    #NewNode!: AppBoxDesign.DesignNodeVO;
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

    #ParentNode!: PixUI.TreeNode<AppBoxDesign.DesignNodeVO>;
    public get ParentNode() {
        return this.#ParentNode;
    }

    private set ParentNode(value) {
        this.#ParentNode = value;
    }

    public WriteTo(ws: AppBoxCore.IOutputStream) {
        throw new System.NotSupportedException();
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        this.ParentNodeType = <AppBoxDesign.DesignNodeType><unknown>rs.ReadByte();
        this.ParentNodeId = rs.ReadString()!;
        this.RootNodeId = rs.ReadString();
        this.InsertIndex = rs.ReadInt();

        //find parent node
        this.ParentNode = AppBoxDesign.DesignStore.TreeController.FindNode(
            n => n.Type == this.ParentNodeType && n.Id == this.ParentNodeId)!;

        let newNodeType = <AppBoxDesign.DesignNodeType><unknown>rs.ReadByte();
        switch (newNodeType) {
            case AppBoxDesign.DesignNodeType.FolderNode:
                this.NewNode = new AppBoxDesign.FolderNodeVO(NewNodeResult.GetModelRootNode(this.ParentNode));
                break;
            case AppBoxDesign.DesignNodeType.ModelNode:
                this.NewNode = new AppBoxDesign.ModelNodeVO(NewNodeResult.GetModelRootNode(this.ParentNode));
                break;
            case AppBoxDesign.DesignNodeType.DataStoreNode:
                this.NewNode = new AppBoxDesign.DataStoreNodeVO();
                break;
            default:
                throw new System.NotSupportedException();
        }

        this.NewNode.ReadFrom(rs);
    }

    private static GetModelRootNode(parentNode: PixUI.TreeNode<AppBoxDesign.DesignNodeVO>): AppBoxDesign.ModelRootNodeVO {
        switch (parentNode.Data.Type) {
            case AppBoxDesign.DesignNodeType.ModelRootNode:
                return <AppBoxDesign.ModelRootNodeVO><unknown>parentNode.Data;
            case AppBoxDesign.DesignNodeType.FolderNode:
                return (<AppBoxDesign.FolderNodeVO><unknown>parentNode.Data).ModelRootNode;
            default:
                throw new System.NotSupportedException();
        }
    }
}
