import * as System from '@/System'
import {IDesignNode} from "./IDesignNode";
import {DesignNodeType} from "./DesignNodeType";
import {IBinSerializable, IInputStream, IOutputStream, ModelType} from "@/AppBoxClient";

export class DesignTree implements IBinSerializable {
    public readonly RootNodes: System.List<DesignNode> = new System.List<DesignNode>();

    ReadFrom(bs: IInputStream): void {
        const count = bs.ReadVariant();
        for (let i = 0; i < count; i++) {
            let nodeType: DesignNodeType = bs.ReadByte();
            let node: DesignNode;
            if (nodeType === DesignNodeType.DataStoreRootNode)
                node = new DataStoreRootNode();
            else if (nodeType === DesignNodeType.ApplicationRoot)
                node = new ApplicationRootNode();
            else
                throw new Error("DesignTree.ReadFrom");
            node.ReadFrom(bs);
            this.RootNodes.push(node);
        }
    }

    WriteTo(bs: IOutputStream): void {
        throw new System.NotSupportedException();
    }
}

export abstract class DesignNode implements IDesignNode, IBinSerializable {
    private _id: string;
    private _label: string;

    get Children(): System.IList<IDesignNode> | null {
        return null;
    }

    get Id(): string {
        return this._id;
    }

    get Label(): string {
        return this._label;
    }

    get Type(): DesignNodeType {
        return undefined;
    }

    ReadFrom(bs: IInputStream): void {
        this._id = bs.ReadString();
        this._label = bs.ReadString();
    }

    WriteTo(bs: IOutputStream): void {
        throw new System.NotSupportedException();
    }

}

export class DataStoreRootNode extends DesignNode {
    private readonly _children: System.List<DataStoreNode> = new System.List<DataStoreNode>();

    get Children(): System.IList<IDesignNode> | null {
        return this._children;
    }

    get Type(): DesignNodeType {
        return DesignNodeType.DataStoreRootNode;
    }

    ReadFrom(bs: IInputStream) {
        super.ReadFrom(bs);

        const count = bs.ReadVariant();
        for (let i = 0; i < count; i++) {
            let dataStoreNode = new DataStoreNode();
            dataStoreNode.ReadFrom(bs);
            this._children.Add(dataStoreNode);
        }
    }
}

export class DataStoreNode extends DesignNode {
    get Type(): DesignNodeType {
        return DesignNodeType.DataStoreNode;
    }
}

export class ApplicationRootNode extends DesignNode {

    private readonly _children: System.List<ApplicationNode> = new System.List<ApplicationNode>();

    get Type(): DesignNodeType {
        return DesignNodeType.ApplicationRoot;
    }

    get Children(): System.IList<IDesignNode> | null {
        return this._children;
    }

    ReadFrom(bs: IInputStream) {
        super.ReadFrom(bs);

        const count = bs.ReadVariant();
        for (let i = 0; i < count; i++) {
            let appNode = new ApplicationNode();
            appNode.ReadFrom(bs);
            this._children.Add(appNode);
        }
    }
}

export class ApplicationNode extends DesignNode {
    private readonly _children: System.List<ModelRootNode> = new System.List<ModelRootNode>();

    get Type(): DesignNodeType {
        return DesignNodeType.ApplicationNode;
    }

    get Children(): System.IList<IDesignNode> | null {
        return this._children;
    }

    ReadFrom(bs: IInputStream) {
        super.ReadFrom(bs);
        const count = bs.ReadVariant();
        for (let i = 0; i < count; i++) {
            let modelRootNode = new ModelRootNode();
            modelRootNode.ReadFrom(bs);
            this._children.Add(modelRootNode);
        }
    }
}

export class ModelRootNode extends DesignNode {
    private readonly _children: System.List<DesignNode> = new System.List<DesignNode>();

    get Children(): System.IList<IDesignNode> | null {
        return this._children;
    }

    get Type(): DesignNodeType {
        return DesignNodeType.ModelRootNode;
    }

    ReadFrom(bs: IInputStream) {
        super.ReadFrom(bs);
        const count = bs.ReadVariant();
        for (let i = 0; i < count; i++) {
            const nodeType = <DesignNodeType>bs.ReadByte();
            let node: DesignNode;
            if (nodeType == DesignNodeType.ModelNode) {
                node = new ModelNode();
            } else if (nodeType == DesignNodeType.FolderNode) {
                throw new System.NotImplementedException();
            } else {
                throw new System.NotSupportedException();
            }

            node.ReadFrom(bs);
            this._children.Add(node);
        }
    }
}

export class ModelNode extends DesignNode {
    private _modelType: ModelType;

    public get ModelType() {
        return this._modelType;
    }

    get Type(): DesignNodeType {
        return DesignNodeType.ModelNode;
    }

    ReadFrom(bs: IInputStream) {
        super.ReadFrom(bs);

        this._modelType = <ModelType>bs.ReadByte();
    }
}
