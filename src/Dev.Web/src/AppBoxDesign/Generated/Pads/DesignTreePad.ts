import * as AppBoxClient from '@/AppBoxClient'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class DesignTreePad extends PixUI.View {
    private readonly _searchKey: PixUI.State<string> = PixUI.State.op_Implicit_From("");
    private _hasLoadTree: boolean = false;

    public constructor() {
        super();
        this.Child = new PixUI.Column().Init(
            {
                Children: [new PixUI.Input(this._searchKey).Init({Prefix: new PixUI.Icon(PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Search))}), new PixUI.TreeView<AppBoxDesign.DesignNode>(AppBoxDesign.DesignStore.TreeController)]
            });
    }

    public static BuildTreeNode(data: AppBoxDesign.DesignNode, node: PixUI.TreeNode<AppBoxDesign.DesignNode>) {
        node.Icon = new PixUI.Icon(PixUI.State.op_Implicit_From(DesignTreePad.GetIconForNode(data)));
        node.Label = new PixUI.Text(PixUI.State.op_Implicit_From(data.Label));
        node.IsLeaf = data.Type == AppBoxDesign.DesignNodeType.ModelNode ||
            data.Type == AppBoxDesign.DesignNodeType.DataStoreNode;
        node.IsExpanded = data.Type == AppBoxDesign.DesignNodeType.DataStoreRootNode ||
            data.Type == AppBoxDesign.DesignNodeType.ApplicationRoot;
    }

    private static GetIconForNode(data: AppBoxDesign.DesignNode): PixUI.IconData {
        switch (data.Type) {
            case AppBoxDesign.DesignNodeType.DataStoreNode:
                return PixUI.Icons.Filled.Storage;
            case AppBoxDesign.DesignNodeType.ApplicationNode:
                return PixUI.Icons.Filled.Widgets;
            case AppBoxDesign.DesignNodeType.ModelNode:
                return AppBoxDesign.IconUtil.GetIconForModelType((<AppBoxDesign.ModelNode><unknown>data).ModelType);
            default:
                return PixUI.Icons.Filled.Folder;
        }
    }

    protected OnMounted() {
        super.OnMounted();

        this.LoadDesignTree();
    }

    private async LoadDesignTree() {
        if (this._hasLoadTree) return;
        this._hasLoadTree = true;

        try {
            let res = await AppBoxClient.Channel.Invoke<AppBoxDesign.DesignTree>("sys.DesignService.LoadDesignTree");
            AppBoxDesign.DesignStore.TreeController.DataSource = res.RootNodes;
        } catch (ex: any) {
            PixUI.Notification.Error("Can't load design tree.");
        }
    }

    public Init(props: Partial<DesignTreePad>): DesignTreePad {
        Object.assign(this, props);
        return this;
    }
}
