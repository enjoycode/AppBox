import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class TreeView<T> extends PixUI.Widget {
    private readonly _controller: PixUI.TreeController<T>;

    private _color: Nullable<PixUI.State<PixUI.Color>>;

    public get Color(): Nullable<PixUI.State<PixUI.Color>> {
        return this._color;
    }

    public set Color(value: Nullable<PixUI.State<PixUI.Color>>) {
        this._color = this.Rebind(this._color, value, PixUI.BindingOptions.AffectsVisual);
    }

    public constructor(controller: PixUI.TreeController<T>, nodeHeight: number = 30) {
        super();
        this._controller = controller;
        this._controller.NodeHeight = nodeHeight;
        this._controller.InitNodes(this);
    }


    public get IsOpaque(): boolean {
        return this._color != null && this._color.Value.Alpha == 0xFF;
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

    public OnChildSizeChanged(child: PixUI.Widget, dx: number, dy: number, affects: PixUI.AffectsByRelayout) {
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
        let needClip = area != null;
        if (needClip) {
            canvas.save();
            canvas.clipRect(area!.GetRect(), CanvasKit.ClipOp.Intersect, false);
        }

        // draw background color if has
        if (this._color != null) {
            canvas.drawRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), PixUI.PaintUtils.Shared((this._color.Value).Clone()));
        }

        this.PaintChildren(canvas, area);

        if (needClip)
            canvas.restore();
    }


    public static CalcMaxChildWidth<Tn>(nodes: System.IList<PixUI.TreeNode<Tn>>): number {
        let maxChildWidth = 0;
        for (const node of nodes) {
            maxChildWidth = Math.max(maxChildWidth, node.W);
        }

        return maxChildWidth;
    }

    public static UpdatePositionAfter<Tn>(child: PixUI.Widget, nodes: System.IList<PixUI.TreeNode<Tn>>, dy: number) {
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

    public Init(props: Partial<TreeView<T>>): TreeView<T> {
        Object.assign(this, props);
        return this;
    }

}
