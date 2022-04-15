import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class TreeController<T> implements PixUI.IStateBindable {
    public readonly DataSource: System.IList<T>;
    public readonly NodeBuilder: System.Action2<T, PixUI.TreeNode<T>>;
    public readonly ChildrenGetter: System.Func2<T, System.IList<T>>;
    public readonly Nodes: System.List<PixUI.TreeNode<T>> = new System.List<PixUI.TreeNode<T>>();

    public HoverColor: PixUI.Color = new PixUI.Color(0xFFAAAAAA); //TODO:

    public NodeIndent: number = 20;
    public NodeHeight: number = 0;
    public TotalWidth: number = 0;
    public TotalHeight: number = 0;

    public constructor(dataSource: System.IList<T>, nodeBuilder: System.Action2<T, PixUI.TreeNode<T>>, childrenGetter: System.Func2<T, System.IList<T>>) {
        this.NodeBuilder = nodeBuilder;
        this.ChildrenGetter = childrenGetter;
        this.DataSource = dataSource;
        if (this.DataSource instanceof PixUI.RxList) {
            const rxList = this.DataSource;
            rxList.AddBinding(this, PixUI.BindingOptions.None);
        }
    }

    public InitNodes(treeView: PixUI.TreeView<T>) {
        for (const item of this.DataSource) {
            let node = new PixUI.TreeNode<T>(item, this);
            this.NodeBuilder(item, node);
            node.Parent = treeView;
            this.Nodes.Add(node);
        }
    }

    public OnStateChanged(state: PixUI.StateBase, options: PixUI.BindingOptions) {
        throw new System.NotImplementedException();
    }

    public Init(props: Partial<TreeController<T>>): TreeController<T> {
        Object.assign(this, props);
        return this;
    }
}
