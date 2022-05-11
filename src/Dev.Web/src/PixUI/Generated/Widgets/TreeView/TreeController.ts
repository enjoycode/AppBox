import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class TreeController<T> implements PixUI.IStateBindable {
    private _treeView: Nullable<PixUI.TreeView<T>>;
    private _dataSource: Nullable<System.IList<T>>;
    public readonly NodeBuilder: System.Action2<T, PixUI.TreeNode<T>>;
    public readonly ChildrenGetter: System.Func2<T, System.IList<T>>;
    public readonly Nodes: System.List<PixUI.TreeNode<T>> = new System.List<PixUI.TreeNode<T>>();


    private readonly _selectedNodes: System.List<PixUI.TreeNode<T>> = new System.List<PixUI.TreeNode<T>>();

    public get FirstSelectedNode(): Nullable<PixUI.TreeNode<T>> {
        return this._selectedNodes.length > 0 ? this._selectedNodes[0] : null;
    }

    public get SelectedNodes(): PixUI.TreeNode<T>[] {
        return this._selectedNodes.ToArray();
    }

    public readonly SelectionChanged = new System.Event();


    public HoverColor: PixUI.Color = new PixUI.Color(0xFFAAAAAA); //TODO:

    public NodeIndent: number = 20;
    public NodeHeight: number = 0;
    public TotalWidth: number = 0;
    public TotalHeight: number = 0;

    public constructor(nodeBuilder: System.Action2<T, PixUI.TreeNode<T>>, childrenGetter: System.Func2<T, System.IList<T>>) {
        this.NodeBuilder = nodeBuilder;
        this.ChildrenGetter = childrenGetter;
    }

    public get DataSource(): Nullable<System.IList<T>> {
        return this._dataSource;
    }

    public set DataSource(value: Nullable<System.IList<T>>) {
        this._dataSource = value;
        // if (DataSource is RxList<T> rxList)
        //     rxList.AddBinding(this, BindingOptions.None);
        if (this._treeView != null && this._treeView.IsMounted) {
            this.Nodes.Clear();
            this.InitNodes(this._treeView);
            this._treeView.Invalidate(PixUI.InvalidAction.Relayout);
        }
    }

    public InitNodes(treeView: PixUI.TreeView<T>) {
        this._treeView = treeView;
        if (this._dataSource == null) return;

        for (const item of this._dataSource) {
            let node = new PixUI.TreeNode<T>(item, this);
            this.NodeBuilder(item, node);
            node.Parent = treeView;
            this.Nodes.Add(node);
        }
    }

    public OnStateChanged(state: PixUI.StateBase, options: PixUI.BindingOptions) {
        throw new System.NotImplementedException();
    }


    public SelectNode(node: PixUI.TreeNode<T>) {
        if (this._selectedNodes.length == 1 && (this._selectedNodes[0] === node))
            return;

        for (const oldSelectedNode of this._selectedNodes) {
            oldSelectedNode.IsSelected.Value = false;
        }

        this._selectedNodes.Clear();

        this._selectedNodes.Add(node);
        node.IsSelected.Value = true;

        this.SelectionChanged.Invoke();
    }

    public Init(props: Partial<TreeController<T>>): TreeController<T> {
        Object.assign(this, props);
        return this;
    }

}
