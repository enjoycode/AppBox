import * as System from '@/System'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

/// <summary>
/// 视图模型设计器的大纲视图
/// </summary>
export class ViewOutlinePad extends PixUI.View {
    public constructor(previewController: AppBoxDesign.PreviewController) {
        super();
        this._previewController = previewController;
        this._treeController.SelectionChanged.Add(this.OnSelectedWidget, this);
        this.BuildWidgetTree();

        this.Child = new PixUI.Column().Init(
            {
                Children:
                    [
                        new PixUI.Input(this._searchKey).Init({Prefix: new PixUI.Icon(PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Search))}),
                        new PixUI.TreeView<AppBoxDesign.WidgetTreeNode>(this._treeController),
                    ]
            });
    }

    private readonly _previewController: AppBoxDesign.PreviewController;

    private readonly _treeController: PixUI.TreeController<AppBoxDesign.WidgetTreeNode> = new PixUI.TreeController<AppBoxDesign.WidgetTreeNode>(ViewOutlinePad.BuildTreeNode, n => n.Children);

    private readonly _searchKey: PixUI.State<string> = PixUI.State.op_Implicit_From("");
    private _inspector: Nullable<PixUI.Inspector> = null;


    protected OnMounted() {
        this._previewController.RefreshOutlineAction = this.BuildWidgetTree.bind(this);
    }

    protected OnUnmounted() {
        this.ClearInspector();
        this._previewController.RefreshOutlineAction = null;
    }

    private static BuildTreeNode(data: AppBoxDesign.WidgetTreeNode, node: PixUI.TreeNode<AppBoxDesign.WidgetTreeNode>) {
        node.Icon = new PixUI.Icon(PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Folder));
        node.Label = new PixUI.Text(PixUI.State.op_Implicit_From(data.Widget.toString()));
        node.IsLeaf = data.Children.length == 0;
        node.IsExpanded = !node.IsLeaf;
    }

    private BuildWidgetTree() {
        this.ClearInspector();
        this._treeController.DataSource = new System.List<AppBoxDesign.WidgetTreeNode>().Init(
            [this._previewController.GetWidgetTree()!]);
    }

    private ClearInspector() {
        this._inspector?.Remove();
        this._inspector = null;
    }

    private OnSelectedWidget() {
        if (this._treeController.FirstSelectedNode == null) {
            this.ClearInspector();
            return;
        }

        this._inspector = PixUI.Inspector.Show(this._treeController.FirstSelectedNode.Data.Widget);
    }
}