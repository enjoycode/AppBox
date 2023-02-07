import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class TreeView<T> extends PixUI.Widget implements PixUI.IScrollable {
    private static readonly $meta_PixUI_IScrollable = true;

    public constructor(controller: PixUI.TreeController<T>, showCheckbox: boolean = false, nodeHeight: number = 30) {
        super();
        this._controller = controller;
        this._controller.NodeHeight = nodeHeight;
        this._controller.ShowCheckbox = showCheckbox;
        this._controller.InitNodes(this);
    }

    private readonly _controller: PixUI.TreeController<T>;

    private _color: Nullable<PixUI.State<PixUI.Color>>;

    /// <summary>
    /// 背景色
    /// </summary>
    public get Color(): Nullable<PixUI.State<PixUI.Color>> {
        return this._color;
    }

    public set Color(value: Nullable<PixUI.State<PixUI.Color>>) {
        this._color = this.Rebind(this._color, value, PixUI.BindingOptions.AffectsVisual);
    }

    public set OnCheckChanged(value: System.Action1<PixUI.TreeNode<T>>) {
        this._controller.CheckChanged.Add(value, this);
    }

    public get ScrollOffsetX(): number {
        return this._controller.ScrollController.OffsetX;
    }

    public get ScrollOffsetY(): number {
        return this._controller.ScrollController.OffsetY;
    }

    public OnScroll(dx: number, dy: number): PixUI.Offset {
        if (this._controller.Nodes.length == 0) return PixUI.Offset.Empty;

        let maxOffsetX = Math.max(0, this._controller.TotalWidth - this.W);
        let maxOffsetY = Math.max(0, this._controller.TotalHeight - this.H);
        let offset = this._controller.ScrollController.OnScroll(dx, dy, maxOffsetX, maxOffsetY);
        if (!offset.IsEmpty) {
            this.Invalidate(PixUI.InvalidAction.Repaint);
        }

        return offset;
    }


    public get IsOpaque(): boolean {
        return this._color != null && this._color.Value.Alpha == 0xFF;
    }

    public get Clipper(): Nullable<PixUI.IClipper> {
        return new PixUI.ClipperOfRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H));
    }

    public VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        for (const node of this._controller.Nodes) {
            if (action(node)) break;
        }
    }

    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);
        this.SetSize(width, height);

        let totalWidth = 0;
        let totalHeight = 0;
        for (const node of this._controller.Nodes) {
            node.Layout(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
            node.SetPosition(0, totalHeight);
            totalWidth = Math.max(totalWidth, node.W);
            totalHeight += node.H;
        }

        this._controller.TotalWidth = totalWidth;
        this._controller.TotalHeight = totalHeight;
    }

    public OnChildSizeChanged(child: PixUI.Widget, dx: number, dy: number,
                              affects: PixUI.AffectsByRelayout) {
        //修改子节点受影响的区域
        affects.OldW = this.W;
        affects.OldH = this.H - child.Y;

        //更新后续子节点的Y坐标
        TreeView.UpdatePositionAfter(child, this._controller.Nodes, dy);

        //更新TreeController总宽及总高
        if (dx > 0) {
            //宽度增加，总宽取现值及当前的大者
            this._controller.TotalWidth = Math.max(child.W, this._controller.TotalWidth);
        }
        // ReSharper disable once CompareOfFloatsByEqualityOperator
        else if (dx < 0 && child.W - dx == this._controller.TotalWidth) {
            //宽度减小，且原本是最宽的那个, 重新计算最宽的子节点
            this._controller.TotalWidth = TreeView.CalcMaxChildWidth(this._controller.Nodes);
        }

        this._controller.TotalHeight += dy;
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        if (this._controller.IsLoading) {
            if (this._color != null)
                canvas.drawRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), PixUI.PaintUtils.Shared(this._color.Value));
            this._controller.LoadingPainter!.PaintToWidget(this, canvas);
            return;
        }

        canvas.save();
        canvas.clipRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), CanvasKit.ClipOp.Intersect, false);

        // draw background color if has
        if (this._color != null)
            canvas.drawRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), PixUI.PaintUtils.Shared(this._color.Value));

        // draw nodes in visual region
        let dirtyRect = (area?.GetRect() ?? PixUI.Rect.FromLTWH(0, 0, this.W, this.H)).Clone();
        for (const node of this._controller.Nodes) {
            let vx = node.X - this.ScrollOffsetX;
            let vy = node.Y - this.ScrollOffsetY;
            if (vy >= dirtyRect.Bottom) break;
            let vb = vy + node.H;
            if (vb <= dirtyRect.Top) continue;

            canvas.translate(vx, vy);
            node.Paint(canvas, null);
            canvas.translate(-vx, -vy);
        }

        canvas.restore();
    }


    /// <summary>
    /// 计算所有子节点的最大宽度
    /// </summary>
    public static CalcMaxChildWidth<Tn>(nodes: System.IList<PixUI.TreeNode<Tn>>): number {
        let maxChildWidth = 0;
        for (const node of nodes) {
            maxChildWidth = Math.max(maxChildWidth, node.W);
        }

        return maxChildWidth;
    }

    /// <summary>
    /// 更新指定子节点之后的子节点的Y坐标
    /// </summary>
    public static UpdatePositionAfter<Tn>(child: PixUI.Widget, nodes: System.IList<PixUI.TreeNode<Tn>>,
                                          dy: number) {
        let indexOfChild = -1;
        for (let i = 0; i < nodes.length; i++) {
            if (indexOfChild == -1) {
                if ((nodes[i] === child))
                    indexOfChild = i;
            } else {
                let node = nodes[i];
                node.SetPosition(node.X, node.Y + dy);
            }
        }
    }

}
