import * as AppBoxDesign from '@/AppBoxDesign'
import * as System from '@/System'
import * as AppBoxCore from '@/AppBoxCore'

export class DesignTreeVO implements AppBoxCore.IBinSerializable {
    public readonly RootNodes: System.List<AppBoxDesign.DesignNodeVO> = new System.List<AppBoxDesign.DesignNodeVO>();

    public WriteTo(ws: AppBoxCore.IOutputStream) {
        throw new System.NotSupportedException();
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        let count = rs.ReadVariant();
        for (let i = 0; i < count; i++) {
            let nodeType = <AppBoxDesign.DesignNodeType><unknown>rs.ReadByte();
            let node: AppBoxDesign.DesignNodeVO;
            if (nodeType == AppBoxDesign.DesignNodeType.DataStoreRootNode)
                node = new AppBoxDesign.DataStoreRootNodeVO();
            else if (nodeType == AppBoxDesign.DesignNodeType.ApplicationRoot)
                node = new AppBoxDesign.ApplicationRootNodeVO();
            else
                throw new System.NotSupportedException();
            node.ReadFrom(rs);
            this.RootNodes.Add(node);
        }
    }
}
