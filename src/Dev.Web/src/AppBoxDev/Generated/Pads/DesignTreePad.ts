import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as AppBoxDev from '@/AppBoxDev'

export class DesignTreePad extends PixUI.View {
    private readonly _searchKey: PixUI.State<string> = PixUI.State.op_Implicit_From("");
    private readonly _treeController: PixUI.TreeController<AppBoxDev.DesignNode>;

    public constructor() {
        super();
        this._treeController = new PixUI.TreeController<AppBoxDev.DesignNode>(new System.List<AppBoxDev.DesignNode>(), this.BuildTreeNode.bind(this), n => n.Children!);

        this.Child = new PixUI.Column
        ().Init({Children: [new PixUI.Input(this._searchKey).Init({Prefix: new PixUI.Icon(PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Search))}), new PixUI.TreeView<AppBoxDev.DesignNode>(this._treeController)]});
    }

    private BuildTreeNode(data: AppBoxDev.DesignNode, node: PixUI.TreeNode<AppBoxDev.DesignNode>) {
        // node.Icon = new Icon(data.Icon);
        // node.Label = new Text(data.Text);
        node.IsLeaf = data.Children == null;
    }

    public Init(props: Partial<DesignTreePad>): DesignTreePad {
        Object.assign(this, props);
        return this;
    }
}
