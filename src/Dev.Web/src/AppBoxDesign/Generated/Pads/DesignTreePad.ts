import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as AppBoxClient from '@/AppBoxClient'

export class DesignTreePad extends PixUI.View {
    private readonly _searchKey: PixUI.State<string> = PixUI.State.op_Implicit_From("");
    private readonly _treeController: PixUI.TreeController<AppBoxDesign.IDesignNode>;
    private _hasLoadTree: boolean = false;

    public constructor() {
        super();
        this._treeController = new PixUI.TreeController<AppBoxDesign.IDesignNode>(DesignTreePad.BuildTreeNode, n => n.Children!);

        this.Child = new PixUI.Column
        ().Init({Children: [new PixUI.Input(this._searchKey).Init({Prefix: new PixUI.Icon(PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Search))}), new PixUI.TreeView<AppBoxDesign.IDesignNode>(this._treeController)]});
    }

    private static BuildTreeNode(data: AppBoxDesign.IDesignNode, node: PixUI.TreeNode<AppBoxDesign.IDesignNode>) {
        node.Icon = new PixUI.Icon(PixUI.State.op_Implicit_From(DesignTreePad.GetIconForNode(data)));
        node.Label = new PixUI.Text(PixUI.State.op_Implicit_From(data.Label));
        node.IsLeaf = data.Children == null || data.Children.length == 0;
        node.IsExpanded = data.Type == AppBoxDesign.DesignNodeType.DataStoreRootNode ||
            data.Type == AppBoxDesign.DesignNodeType.ApplicationRoot;
    }

    private static GetIconForNode(data: AppBoxDesign.IDesignNode): PixUI.IconData {
        switch (data.Type) {
            case AppBoxDesign.DesignNodeType.DataStoreNode:
                return PixUI.Icons.Filled.Storage;
            case AppBoxDesign.DesignNodeType.ApplicationNode:
                return PixUI.Icons.Filled.Widgets;
            case AppBoxDesign.DesignNodeType.ModelNode:
                return PixUI.Icons.Filled.TableChart; //TODO:
            default:
                return PixUI.Icons.Filled.Folder;
        }
    }

    protected OnMounted() {
        super.OnMounted();

        this.LoadDesignTree();
    }

    private async LoadDesignTree(): System.Task {
        if (this._hasLoadTree) return;
        this._hasLoadTree = true;

        let tree = <AppBoxDesign.IDesignTree><unknown>await AppBoxClient.Channel.Invoke("sys.DesignService.LoadDesignTree");
        this._treeController.DataSource = tree.RootNodes;
    }

    public Init(props: Partial<DesignTreePad>): DesignTreePad {
        Object.assign(this, props);
        return this;
    }
}
