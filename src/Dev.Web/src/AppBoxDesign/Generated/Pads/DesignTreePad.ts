import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as AppBoxDesign from '@/AppBoxDesign'

export class DesignTreePad extends PixUI.View {
    private readonly _searchKey: PixUI.State<string> = PixUI.State.op_Implicit_From("");
    private readonly _treeController: PixUI.TreeController<AppBoxDesign.IDesignNode>;

    public constructor() {
        super();
        this._treeController = new PixUI.TreeController<AppBoxDesign.IDesignNode>(new System.List<AppBoxDesign.IDesignNode>(), DesignTreePad.BuildTreeNode, n => n.Children!);

        this.Child = new PixUI.Column
        ().Init({Children: [new PixUI.Input(this._searchKey).Init({Prefix: new PixUI.Icon(PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Search))}), new PixUI.TreeView<AppBoxDesign.IDesignNode>(this._treeController)]});
    }

    private static BuildTreeNode(data: AppBoxDesign.IDesignNode, node: PixUI.TreeNode<AppBoxDesign.IDesignNode>) {
        // node.Icon = new Icon(data.Icon);
        node.Label = new PixUI.Text(PixUI.State.op_Implicit_From(data.Label));
        node.IsLeaf = data.Children == null;
    }

    public Init(props: Partial<DesignTreePad>): DesignTreePad {
        Object.assign(this, props);
        return this;
    }
}
