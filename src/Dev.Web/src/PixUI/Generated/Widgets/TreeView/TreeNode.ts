import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class TreeNode<T> extends PixUI.Widget {

    public readonly Data: T;
    private readonly _controller: PixUI.TreeController<T>;

    public get Controller(): PixUI.TreeController<T> {
        return this._controller;
    }

    private readonly _row: PixUI.TreeNodeRow<T>;
    private _children: Nullable<System.List<TreeNode<T>>>;

    public readonly IsSelected: PixUI.State<boolean> = PixUI.State.op_Implicit_From(false);
    private readonly _color: PixUI.State<PixUI.Color>; //for icon and label

    private _expandController: Nullable<PixUI.AnimationController>;
    private _expandCurve: Nullable<PixUI.Animation<number>>;
    private _expandArrowAnimation: Nullable<PixUI.Animation<number>>;

    public set Icon(value: PixUI.Icon) {
        this._row.Icon = value;
        this._row.Icon.Color ??= this._color;
    }

    public set Label(value: PixUI.Text) {
        this._row.Label = value;
        this._row.Label.Color ??= this._color;
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

    public get TreeView(): Nullable<PixUI.TreeView<T>> {
        let temp: PixUI.Widget = this;
        while (true) {
            if (temp.Parent == null)
                return null;
            if (temp.Parent instanceof PixUI.TreeView) {
                const treeView = temp.Parent;
                return treeView;
            }
            if (!(temp.Parent instanceof TreeNode))
                return null;
            temp = temp.Parent;
        }
    }


    public constructor(data: T, controller: PixUI.TreeController<T>) {
        super();
        this.Data = data;
        this._controller = controller;
        this._row = new PixUI.TreeNodeRow<T>();
        this._row.Parent = this;

        this._color = this.Compute1(this.IsSelected, s => s ? PixUI.Theme.FocusedColor : PixUI.Colors.Black); //TODO:

        this.Bind(this.IsSelected, PixUI.BindingOptions.AffectsVisual);
    }


    private TryBuildExpandIcon(): Nullable<PixUI.ExpandIcon> {
        if (this._expandController != null) return null;

        this._expandController = new PixUI.AnimationController(200, this.IsExpanded ? 1 : 0);
        this._expandController.ValueChanged.Add(this.OnAnimationValueChanged, this);
        this._expandCurve = new PixUI.CurvedAnimation(this._expandController, PixUI.Curves.EaseInOutCubic);
        this._expandArrowAnimation = new PixUI.FloatTween(0.75, 1.0).Animate(this._expandCurve);

        let expander = new PixUI.ExpandIcon(this._expandArrowAnimation);
        expander.OnPointerDown = this.OnTapExpander.bind(this);
        return expander;
    }

    private OnAnimationValueChanged() {
        this._animationValue = this._expandController!.Value;
        this.Invalidate(PixUI.InvalidAction.Relayout); //自身改变高度并通知上级
    }

    private TryBuildAndLayoutChildren(): number {
        if (this._children != null) {
            return PixUI.TreeView.CalcMaxChildWidth(this._children!);
        }

        let childrenList = this._controller.ChildrenGetter(this.Data);
        this._children = new System.List<TreeNode<T>>(childrenList.length);
        let maxWidth = 0;
        for (let i = 0; i < childrenList.length; i++) {
            let child = childrenList[i];
            let node = new TreeNode<T>(child, this._controller);
            this._controller.NodeBuilder(child, node);
            node.Parent = this;
            this._children.Add(node);

            node.Layout(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
            node.SetPosition(0, (i + 1) * this._controller.NodeHeight);

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
            let maxChildWidth = this.TryBuildAndLayoutChildren(); //先尝试Build子节点
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
        this.HasLayout = true;

        // try build expand icon
        if (!this.IsLeaf) {
            let expander = this.TryBuildExpandIcon();
            if (expander != null)
                this._row.ExpandIcon = expander;
        }

        this._row.Layout(Number.POSITIVE_INFINITY, this.Controller.NodeHeight);

        if (this.IsLeaf || !this.IsExpanded) {
            this.SetSize(this._row.W, this._controller.NodeHeight);
            return;
        }

        // expanded, continue layout children, 注意仅由初始化加载时设置的IsExpanded
        if (!this.IsLeaf && this.IsExpanded) {
            let maxChildWidth = this.TryBuildAndLayoutChildren();
            this.SetSize(Math.max(this._row.W, maxChildWidth), this._controller.NodeHeight * (this._children!.length + 1));
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
            canvas.clipRect(PixUI.Rect.FromLTWH(0, 0, this.TreeView!.W, this.H), CanvasKit.ClipOp.Intersect, false);
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

    public Init(props: Partial<TreeNode<T>>): TreeNode<T> {
        Object.assign(this, props);
        return this;
    }

}
