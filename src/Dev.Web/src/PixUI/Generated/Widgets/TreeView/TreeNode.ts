import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class TreeNode<T> extends PixUI.Widget {
    public constructor(data: T, controller: PixUI.TreeController<T>) {
        super();
        this.Data = data;
        this._controller = controller;
        this._row = new PixUI.TreeNodeRow<T>();
        this._row.Parent = this;

        this._color = this.Compute1(this.IsSelected, s => s ? PixUI.Theme.FocusedColor : PixUI.Colors.Black); //TODO:

        this.Bind(this.IsSelected, PixUI.BindingOptions.AffectsVisual);
    }


    public readonly Data: T;
    private readonly _controller: PixUI.TreeController<T>;

    public get Controller(): PixUI.TreeController<T> {
        return this._controller;
    }

    private readonly _row: PixUI.TreeNodeRow<T>;
    private _children: Nullable<System.List<TreeNode<T>>>;

    public readonly IsSelected: PixUI.State<boolean> = PixUI.State.op_Implicit_From(false);
    private readonly _color: PixUI.State<PixUI.Color>; //for icon and label

    private _expandController: Nullable<PixUI.AnimationController>; //TODO:考虑提升至TreeController共用实例
    private _expandCurve: Nullable<PixUI.Animation<number>>;
    private _expandArrowAnimation: Nullable<PixUI.Animation<number>>;

    public set Icon(value: PixUI.Icon) {
        this._row.Icon = value;
        this._row.Icon.Color ??= this._color;
    }

    public set Label(value: PixUI.Text) {
        this._row.Label = value;
        this._row.Label.TextColor ??= this._color;
    }

    public IsLeaf: boolean = false;
    public IsLazyLoad: boolean = false;
    public IsExpanded: boolean = false;


    private _animationFlag: number = 0; //0=none,1=expand,-1=collapse
    private _animationValue: number = 0;

    private get IsExpanding(): boolean {
        return this._animationFlag == 1;
    }

    private get IsCollapsing(): boolean {
        return this._animationFlag == -1;
    }

    public get Depth(): number {
        let temp: PixUI.Widget = this;
        let depth = 0;
        while (true) {
            if (temp.Parent instanceof PixUI.TreeView)
                break;
            depth++;
            temp = temp.Parent!;
        }

        return depth;
    }


    private TryBuildExpandIcon() {
        if (this._expandController != null) return;

        this._expandController = new PixUI.AnimationController(200, this.IsExpanded ? 1 : 0);
        this._expandController.ValueChanged.Add(this.OnAnimationValueChanged, this);
        this._expandCurve = new PixUI.CurvedAnimation(this._expandController, PixUI.Curves.EaseInOutCubic);
        this._expandArrowAnimation = new PixUI.FloatTween(0.75, 1.0).Animate(this._expandCurve);

        let expander = new PixUI.ExpandIcon(this._expandArrowAnimation);
        expander.OnPointerDown = this.OnTapExpander.bind(this);
        this._row.ExpandIcon = expander;
    }

    private OnAnimationValueChanged() {
        this._animationValue = this._expandController!.Value;
        this.Invalidate(PixUI.InvalidAction.Relayout); //自身改变高度并通知上级
    }

    private TryBuildChildren() {
        if (this.IsLeaf || this._children != null) return;

        let childrenList = this._controller.ChildrenGetter(this.Data);
        this._children = new System.List<TreeNode<T>>(childrenList.length);
        for (const child of childrenList) {
            let node = new TreeNode<T>(child, this._controller);
            this._controller.NodeBuilder(child, node);
            node.Parent = this;
            this._children.Add(node);
        }
    }

    private TryBuildAndLayoutChildren(): number {
        if (this._children != null && this.HasLayout && this._children.All(t => t.HasLayout)) {
            return PixUI.TreeView.CalcMaxChildWidth(this._children);
        }

        this.TryBuildChildren();

        let maxWidth = 0;
        let yPos = this._controller.NodeHeight;
        for (let i = 0; i < this._children!.length; i++) {
            let node = this._children[i];
            node.Layout(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
            node.SetPosition(0, yPos);
            yPos += node.H;
            maxWidth = Math.max(maxWidth, node.W);
        }

        return maxWidth;
    }

    private OnTapExpander(e: PixUI.PointerEvent) {
        //TODO:先判断是否LazyLoad，是则异步加载后再处理

        if (this.IsExpanded) {
            this.IsExpanded = false;
            this._animationFlag = -1;
            this._expandController?.Reverse();
        } else {
            let maxChildWidth = this.TryBuildAndLayoutChildren(); //先尝试布局子节点
            this.SetSize(Math.max(this.W, maxChildWidth), this.H); //仅预设宽度

            this.IsExpanded = true;
            this._animationFlag = 1;
            this._expandController?.Forward();
        }
    }


    public VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        if (action(this._row)) return;

        if (!this.IsLeaf && this.IsExpanded && this._children != null) {
            for (const child of this._children) {
                if (action(child)) break;
            }
        }
    }

    public ContainsPoint(x: number, y: number): boolean {
        return y >= 0 && y < this.H;
    }

    public HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        //只需要判断坐标Y来确定是否命中行
        if (y < 0 || y > this.H) return false;

        result.Add(this);

        //先判断是否命中TreeNodeRow
        if (y <= this._controller.NodeHeight) {
            this.HitTestChild(this._row, x, y, result);
        } else {
            if (!this.IsLeaf && this._children != null) {
                for (const child of this._children) {
                    if (this.HitTestChild(child, x, y, result))
                        break;
                }
            }
        }

        return true;
    }

    public Layout(availableWidth: number, availableHeight: number) {
        //先处理是否由动画引起的高度改变
        if (this.IsExpanding || this.IsCollapsing) {
            //根据动画值计算需要展开的高度
            let totalChildrenHeight = this._children!.Sum(t => t.H);
            let expandedHeight = <number><unknown>(totalChildrenHeight * this._animationValue);
            if (this.IsCollapsing && this._animationValue == 0) //已收缩需要恢复本身的宽度
            {
                this._animationFlag = 0;
                this.SetSize(this._row.W, this._controller.NodeHeight);
            }
            // ReSharper disable once CompareOfFloatsByEqualityOperator
            else if (this.IsExpanding && this._animationValue == 1) {
                this._animationFlag = 0;
                this.SetSize(this.W, this._controller.NodeHeight + totalChildrenHeight); //宽度之前已预设
            } else {
                this.SetSize(this.W, this._controller.NodeHeight + expandedHeight); //宽度之前已预设
            }

            return;
        }

        if (this.HasLayout) return;

        // try build expand icon
        if (!this.IsLeaf)
            this.TryBuildExpandIcon();

        this._row.Layout(Number.POSITIVE_INFINITY, this.Controller.NodeHeight);

        if (this.IsLeaf || !this.IsExpanded) {
            this.SetSize(this._row.W, this._controller.NodeHeight);
            this.HasLayout = true;
            return;
        }

        // expanded, continue build and layout children
        if (!this.IsLeaf && this.IsExpanded) {
            let maxChildWidth = this.TryBuildAndLayoutChildren();
            this.SetSize(Math.max(this._row.W, maxChildWidth), this._controller.NodeHeight + this._children!.Sum(t => t.H));
            this.HasLayout = true;
        }
    }

    public OnChildSizeChanged(child: PixUI.Widget, dx: number, dy: number, affects: PixUI.AffectsByRelayout) {
        let oldWidth = this.W;
        let oldHeight = this.H;
        affects.Widget = this;
        PixUI.TreeView.UpdatePositionAfter(child, this._children!, dy);

        //更新自身的宽高
        let newWidth = oldWidth;
        let newHeight = oldHeight + dy;
        if (dx > 0) {
            //宽度增加，总宽取现值及当前的大者
            newWidth = Math.max(child.W, this.W);
        }
        // ReSharper disable once CompareOfFloatsByEqualityOperator
        else if (dx < 0 && child.W - dx == this._controller.TotalWidth) {
            //宽度减小，且原本是最宽的那个, 重新计算最宽的子节点
            newWidth = Math.max(PixUI.TreeView.CalcMaxChildWidth(this._children!), this.W);
        }

        this.SetSize(newWidth, newHeight);

        //继续通知上级节点尺寸变更
        this.Parent!.OnChildSizeChanged(this, newWidth - oldWidth, newHeight - oldHeight, affects);
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        if (this.IsExpanding || this.IsCollapsing) //need clip expanding area
        {
            canvas.save();
            canvas.clipRect(PixUI.Rect.FromLTWH(0, 0, this._controller.TreeView!.W, this.H), CanvasKit.ClipOp.Intersect, false);
        }

        this._row.Paint(canvas, area);

        if (this.IsExpanding || this.IsCollapsing) {
            for (let i = 0; i < this._children!.length; i++) {
                TreeNode.PaintChildNode(this._children[i], canvas, area);
                if ((i + 1) * this._controller.NodeHeight >= this.H)
                    break;
            }

            canvas.restore();
        } else if (!this.IsLeaf && this.IsExpanded) {
            for (const child of this._children!) {
                TreeNode.PaintChildNode(child, canvas, area);
            }
        }
    }

    private static PaintChildNode(child: PixUI.Widget, canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea>) {
        //TODO:判断是否可见
        canvas.translate(child.X, child.Y);
        child.Paint(canvas, area?.ToChild(child.X, child.Y));
        canvas.translate(-child.X, -child.Y);

        PixUI.PaintDebugger.PaintWidgetBorder(child, canvas);
    }

    public toString(): string {
        let labelText = this._row.Label == null ? "" : this._row.Label.Text.Value;
        return `TreeNode[\"${labelText}\"]`;
    }


    public FindNode(predicate: System.Predicate<T>): Nullable<TreeNode<T>> {
        if (predicate(this.Data)) return this;

        if (!this.IsLeaf) {
            this.TryBuildChildren(); //可能收缩中还没有构建子节点

            for (const child of this._children!) {
                let found = child.FindNode(predicate);
                if (found != null) return found;
            }
        }

        return null;
    }

    public Expand() {
        if (this.IsLeaf || this.IsExpanded) return;

        this.IsExpanded = true;
        this.HasLayout = false;
        this.TryBuildExpandIcon();
        this._expandController!.Forward(1);
        if ((this.Parent === this._controller.TreeView))
            this._controller.TreeView!.Invalidate(PixUI.InvalidAction.Relayout);
        else
            this.Invalidate(PixUI.InvalidAction.Relayout);
    }

    public InsertChild(index: number, child: TreeNode<T>) {
        if (this.IsLeaf) return;

        this.TryBuildChildren();

        let insertIndex = index < 0 ? this._children!.length : index;
        this._children!.Insert(insertIndex, child);
        //同步数据
        let dataChildren = this._controller.ChildrenGetter(this.Data);
        dataChildren.Insert(insertIndex, child.Data);
        //Reset HasLayout
        this.HasLayout = false;
    }

    public RemoveChild(child: TreeNode<T>) {
        this._children!.Remove(child);
        //同步数据
        let dataChildren = this._controller.ChildrenGetter(this.Data);
        dataChildren.Remove(child.Data);
        //Reset HasLayout
        this.HasLayout = false;
    }

    public Init(props: Partial<TreeNode<T>>): TreeNode<T> {
        Object.assign(this, props);
        return this;
    }

}
