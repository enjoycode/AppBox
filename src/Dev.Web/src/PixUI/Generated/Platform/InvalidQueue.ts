import * as System from '@/System'
import * as PixUI from '@/PixUI'
/// <summary>
/// Widget重新布局后向上所影响的Widget及区域
/// </summary>
export class AffectsByRelayout {
    public static readonly Default: AffectsByRelayout = new AffectsByRelayout();

    public Widget: PixUI.Widget;
    public OldX: number = 0;
    public OldY: number = 0;
    public OldW: number = 0;
    public OldH: number = 0;

    private constructor() {
    }

    public GetDirtyArea(): PixUI.IDirtyArea {
        //TODO: 考虑Root返回null或现有Bounds
        return new PixUI.RepaintArea(new PixUI.Rect(Math.min(this.OldX, this.Widget.X), Math.min(this.OldY, this.Widget.Y), Math.max(this.OldX + this.OldW, this.Widget.X + this.Widget.W), Math.max(this.OldY + this.OldH, this.Widget.Y + this.Widget.H)));
    }

    public Init(props: Partial<AffectsByRelayout>): AffectsByRelayout {
        Object.assign(this, props);
        return this;
    }
}

export enum InvalidAction {
    Repaint,
    Relayout
}

export class InvalidWidget {
    public Widget: PixUI.Widget;
    public Action: InvalidAction = 0;
    public Level: number = 0;

    public Area: Nullable<PixUI.IDirtyArea>;

    public constructor() //Need for web now, TODO:use TSRecordAttribute
    {
    }

    public Init(props: Partial<InvalidWidget>): InvalidWidget {
        Object.assign(this, props);
        return this;
    }
}

/// <summary>
/// Dirty widget queue, One UIWindow has two queue.
/// </summary>
export class InvalidQueue {

    public static Add(widget: PixUI.Widget, action: InvalidAction, item: Nullable<PixUI.IDirtyArea>): boolean {
        //暂在这里判断Widget是否已挂载
        if (!widget.IsMounted) return false;

        //根据Widget所在的画布加入相应的队列
        let root = widget.Root!;
        if (root instanceof PixUI.Overlay) {
            //When used for overlay, only Relayout invalid add to queue.
            if (action == InvalidAction.Relayout)
                root.Window.OverlayInvalidQueue.AddInternal(widget, action, item);
        } else {
            root.Window.WidgetsInvalidQueue.AddInternal(widget, action, item);
        }

        if (!root.Window.HasPostInvalidateEvent) {
            root.Window.HasPostInvalidateEvent = true;
            PixUI.UIApplication.Current.PostInvalidateEvent();
        }

        return true;
    }


    private readonly _queue: System.List<InvalidWidget> = new System.List<InvalidWidget>(32);

    public get IsEmpty(): boolean {
        return this._queue.length == 0;
    }

    private AddInternal(widget: PixUI.Widget, action: InvalidAction, item: Nullable<PixUI.IDirtyArea>) {
        //先尝试合并入现有项
        let level = InvalidQueue.GetLevelToTop(widget);
        let insertPos = 0; // -1 mean has merged to exist.
        for (const exist of this._queue) {
            if (exist.Level > level) break;

            // check is same widget
            if ((exist.Widget === widget)) {
                if (exist.Action < action)
                    exist.Action = action;
                if (exist.Action == InvalidAction.Repaint && action == InvalidAction.Repaint) {
                    if (item == null)
                        exist.Area = null;
                    exist.Area?.Merge(item);
                }

                insertPos = -1;
                break;
            }

            // check is any parent of current
            if (exist.Widget.IsAnyParentOf(widget)) {
                if (exist.Action == InvalidAction.Relayout ||
                    (exist.Action == InvalidAction.Repaint && action == InvalidAction.Repaint)) {
                    insertPos = -1;
                    break;
                }
            }

            insertPos++;
        }

        if (insertPos < 0) return;

        //在同一上级的子级内排序,eg: 同一Stack内的两个widget同时需要刷新，但要控制重绘顺序
        if (widget.Parent != null) {
            for (let i = insertPos - 1; i >= 0; i--) {
                let exist = this._queue[i];
                if (exist.Level < level) break;
                //same level now, check parent is same
                if (!(exist.Widget.Parent === widget.Parent)) continue;
                //compare index of same parent
                let existIndex = widget.Parent.IndexOfChild(exist.Widget);
                let curIndex = widget.Parent.IndexOfChild(widget);
                if (curIndex > existIndex) break;
                insertPos = i;
            }
        }

        // insert to invalid queue.
        //TODO:use object pool for InvalidWidget
        let target = new InvalidWidget
        ().Init({Widget: widget, Action: action, Level: level, Area: item});
        this._queue.Insert(insertPos, target);
    }

    private static GetLevelToTop(widget: PixUI.Widget): number {
        let level = 0;
        let cur: PixUI.Widget = widget;
        while (cur.Parent != null) {
            level++;
            cur = cur.Parent;
        }

        return level;
    }

    public RenderFrame(context: PixUI.PaintContext) {
        let hasRelayout = false;

        for (const item of this._queue) {
            if (item.Action == InvalidAction.Relayout) {
                hasRelayout = true;
                let affects = AffectsByRelayout.Default;
                InvalidQueue.RelayoutWidget(item.Widget, affects);
                //注意: 以下重绘的是受影响Widget的上级，除非本身是根节点
                InvalidQueue.RepaintWidget(context, affects.Widget.Parent ?? affects.Widget, affects.GetDirtyArea());
            } else {
                InvalidQueue.RepaintWidget(context, item.Widget, item.Area);
            }
        }

        // clear items
        this._queue.Clear();

        // 通知重新进行HitTest TODO:确认布局影响，eg:Input重布局没有改变大小，则不需要重新HitTest
        if (hasRelayout)
            context.Window.AfterLayoutChanged();
    }

    public RelayoutAll() {
        for (const item of this._queue) {
            if (item.Action == InvalidAction.Relayout) {
                let affects = AffectsByRelayout.Default;
                InvalidQueue.RelayoutWidget(item.Widget, affects);
            } else {
                throw new System.InvalidOperationException();
            }
        }

        // clear items
        this._queue.Clear();
    }

    private static RelayoutWidget(widget: PixUI.Widget, affects: AffectsByRelayout) {
        //先初始化受影响的Widget(必须因为可能重新布局后没有改变大小)
        affects.Widget = widget;
        affects.OldX = widget.X;
        affects.OldY = widget.Y;
        affects.OldW = widget.W;
        affects.OldH = widget.H;

        //再重新布局并尝试通知上级
        widget.Layout(widget.CachedAvailableWidth, widget.CachedAvailableHeight);
        widget.TryNotifyParentIfSizeChanged(affects.OldW, affects.OldH, affects);
    }

    private static RepaintWidget(ctx: PixUI.PaintContext, widget: PixUI.Widget, dirtyArea: Nullable<PixUI.IDirtyArea>) {
        console.log(`Repaint: ${widget} rect=${dirtyArea?.GetRect()}`);
        let canvas = ctx.Canvas;

        //TODO:不能简单判断是否不透明，例如上级有OpacityWidget or ImageFilter等
        //Find first opaque (self or parent) to clear dirty area
        if (widget.IsOpaque) //self is opaque
        {
            let pt2Win = widget.LocalToWindow(0, 0);
            canvas.translate(pt2Win.X, pt2Win.Y);
            widget.Paint(canvas, dirtyArea);
            canvas.translate(-pt2Win.X, -pt2Win.Y);
            return;
        }

        //向上查找不透明的父级组件
        let opaque: Nullable<//向上查找不透明的父级组件
            PixUI.Widget> = null;
        let current: PixUI.Widget = widget;
        let dx: number = 0; //当前需要重绘的Widget相对于不透明的上级的坐标偏移X
        let dy: number = 0; //当前需要重绘的Widget相对于不透明的上级的坐标偏移Y
        while (current.Parent != null) {
            dx += current.X;
            dy += current.Y;

            current = current.Parent;
            if (current.IsOpaque) {
                opaque = current;
                break;
            }
        }

        opaque ??= current; //没找到暂指向Window's RootWidget

        //计算脏区域(重绘的Widget相对于Opaque Widget)
        let dirtyRect = (dirtyArea?.GetRect())?.Clone();
        let dirtyX = dx + (dirtyRect?.Left ?? 0);
        let dirtyY = dy + (dirtyRect?.Top ?? 0);
        let dirtyW = dirtyRect?.Width ?? widget.W;
        let dirtyH = dirtyRect?.Height ?? widget.H;
        let dirtyChildRect = PixUI.Rect.FromLTWH(dirtyX, dirtyY, dirtyW, dirtyH);

        //裁剪脏区域并开始绘制
        canvas.save();
        let opaque2Win = opaque.LocalToWindow(0, 0);
        canvas.translate(opaque2Win.X, opaque2Win.Y);
        canvas.clipRect(dirtyChildRect, CanvasKit.ClipOp.Intersect, false); //TODO: Root不用
        //判断是否RootWidget且非不透明，是则清空画布脏区域
        if ((opaque === ctx.Window.RootWidget) && !opaque.IsOpaque)
            canvas.clear(ctx.Window.BackgroundColor);
        opaque.Paint(canvas, new PixUI.RepaintArea((dirtyChildRect).Clone()));
        canvas.restore();
    }

    public Init(props: Partial<InvalidQueue>): InvalidQueue {
        Object.assign(this, props);
        return this;
    }
}
