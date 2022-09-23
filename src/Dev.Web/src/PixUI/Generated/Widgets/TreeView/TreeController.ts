import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class TreeController<T> implements PixUI.IStateBindable {
    public constructor(nodeBuilder: System.Action2<T, PixUI.TreeNode<T>>, childrenGetter: System.Func2<T, System.IList<T>>) {
        this.NodeBuilder = nodeBuilder;
        this.ChildrenGetter = childrenGetter;
    }

    #TreeView: Nullable<PixUI.TreeView<T>>;
    public get TreeView() {
        return this.#TreeView;
    }

    private set TreeView(value) {
        this.#TreeView = value;
    }

    public readonly NodeBuilder: System.Action2<T, PixUI.TreeNode<T>>;
    public readonly ChildrenGetter: System.Func2<T, System.IList<T>>;
    public readonly Nodes: System.List<PixUI.TreeNode<T>> = new System.List<PixUI.TreeNode<T>>();
    public readonly ScrollController: PixUI.ScrollController = new PixUI.ScrollController(PixUI.ScrollDirection.Both);


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

    private _isLoading: boolean = false;
    #LoadingPainter: Nullable<PixUI.CircularProgressPainter>;
    public get LoadingPainter() {
        return this.#LoadingPainter;
    }

    private set LoadingPainter(value) {
        this.#LoadingPainter = value;
    }

    public get IsLoading(): boolean {
        return this._isLoading;
    }

    public set IsLoading(value: boolean) {
        if (this._isLoading == value) return;
        this._isLoading = value;
        if (this._isLoading) {
            this.LoadingPainter = new PixUI.CircularProgressPainter();
            this.LoadingPainter.Start(() => this.TreeView?.Invalidate(PixUI.InvalidAction.Repaint));
        } else {
            this.LoadingPainter?.Stop();
            this.LoadingPainter?.Dispose();
            this.LoadingPainter = null;
        }

        this.TreeView?.Invalidate(PixUI.InvalidAction.Repaint);
    }

    private _dataSource: Nullable<System.IList<T>>;

    public get DataSource(): Nullable<System.IList<T>> {
        return this._dataSource;
    }

    public set DataSource(value: Nullable<System.IList<T>>) {
        this._dataSource = value;
        // if (DataSource is RxList<T> rxList)
        //     rxList.AddBinding(this, BindingOptions.None);
        if (this.TreeView != null && this.TreeView.IsMounted) {
            this.Nodes.Clear();
            this.InitNodes(this.TreeView);
            this.TreeView.Invalidate(PixUI.InvalidAction.Relayout);
        }
    }

    public InitNodes(treeView: PixUI.TreeView<T>) {
        this.TreeView = treeView;
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


    public FindNode(predicate: System.Predicate<T>): Nullable<PixUI.TreeNode<T>> {
        for (const child of this.Nodes) {
            let found = child.FindNode(predicate);
            if (found != null) return found;
        }

        return null;
    }

    public SelectNode(node: PixUI.TreeNode<T>) {
        //是否已经选择
        if (this._selectedNodes.length == 1 && (this._selectedNodes[0] === node))
            return;

        //取消旧的选择并选择新的
        for (const oldSelectedNode of this._selectedNodes) {
            oldSelectedNode.IsSelected.Value = false;
        }

        this._selectedNodes.Clear();

        this._selectedNodes.Add(node);
        node.IsSelected.Value = true;

        this.SelectionChanged.Invoke();
    }

    public ExpandTo(node: PixUI.TreeNode<T>) {
        let temp = node.Parent;
        while (temp != null && !(temp === this.TreeView)) {
            let tempNode = <PixUI.TreeNode<T>><unknown>temp;
            tempNode.Expand();
            temp = tempNode.Parent;
        }

        //TODO: scroll to
    }

    public InsertNode(child: T, parentNode: Nullable<PixUI.TreeNode<T>> = null, insertIndex: number = -1): PixUI.TreeNode<T> {
        let node = new PixUI.TreeNode<T>(child, this);
        this.NodeBuilder(child, node);
        if (parentNode == null) {
            node.Parent = this.TreeView;
            let index = insertIndex < 0 ? this.Nodes.length : insertIndex;
            this.Nodes.Insert(index, node);
            this.DataSource!.Insert(index, child);
            //强制重新布局
            this.TreeView!.Invalidate(PixUI.InvalidAction.Relayout);
        } else {
            node.Parent = parentNode;
            parentNode.InsertChild(insertIndex, node);
            //强制重新布局
            if (parentNode.IsExpanded)
                parentNode.Invalidate(PixUI.InvalidAction.Relayout);
        }

        return node;
    }

    public RemoveNode(node: PixUI.TreeNode<T>) {
        if ((node.Parent === this.TreeView)) {
            this.Nodes.Remove(node);
            this.DataSource!.Remove(node.Data);
            node.Parent = null;
            //强制重新布局
            this.TreeView!.Invalidate(PixUI.InvalidAction.Relayout);
        } else {
            let parentNode = <PixUI.TreeNode<T>><unknown>node.Parent!;
            parentNode.RemoveChild(node);
            node.Parent = null;
            //强制重新布局
            if (parentNode.IsExpanded)
                parentNode.Invalidate(PixUI.InvalidAction.Relayout);
        }

        //如果是选择的，则清除
        let selectedAt = this._selectedNodes.IndexOf(node);
        if (selectedAt >= 0) {
            this._selectedNodes.RemoveAt(selectedAt);
            this.SelectionChanged.Invoke();
        }
    }

    public Init(props: Partial<TreeController<T>>): TreeController<T> {
        Object.assign(this, props);
        return this;
    }

}
