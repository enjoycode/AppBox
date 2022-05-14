import * as AppBoxDesign from '@/AppBoxDesign'
import * as System from '@/System'
import * as AppBoxCore from '@/AppBoxCore'

export class DesignTree implements AppBoxCore.IBinSerializable {
    public readonly RootNodes: System.List<AppBoxDesign.DesignNode> = new System.List<AppBoxDesign.DesignNode>();

    public WriteTo(ws: AppBoxCore.IOutputStream) {
        throw new System.NotSupportedException();
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        let count = rs.ReadVariant();
        for (let i = 0; i < count; i++) {
            let nodeType = <AppBoxDesign.DesignNodeType><unknown>rs.ReadByte();
            let node: AppBoxDesign.DesignNode;
            if (nodeType == AppBoxDesign.DesignNodeType.DataStoreRootNode)
                node = new AppBoxDesign.DataStoreRootNode();
            else if (nodeType == AppBoxDesign.DesignNodeType.ApplicationRoot)
                node = new AppBoxDesign.ApplicationRootNode();
            else
                throw new System.NotSupportedException();
            node.ReadFrom(rs);
            this.RootNodes.Add(node);
        }
    }

    public Init(props: Partial<DesignTree>): DesignTree {
        Object.assign(this, props);
        return this;
    }
}
