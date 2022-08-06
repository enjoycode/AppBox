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
        return new PixUI.RepaintArea(new PixUI.Rect(Math.min(this.OldX, this.Widget.X), Math.min(this.OldY, this.Widget.Y), Math.max(this.OldX + this.OldW, this.Widget.X + this.Widget.W), Math.max(this.OldY + this.OldH, this.Widget.Y + this.Widget.H))
        );
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
    public RelayoutOnly: boolean = false;

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
        let relayoutOnly = false;

        for (const exist of this._queue) {
            if (exist.Level > level) {
                //TODO:判断新项是否现存项的任意上级，是则尝试合并
                break;
            }

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

                //上级要求重绘，子级要求重新布局的情况，尽可能标记当前项为RelayoutOnly
                relayoutOnly = true;
                exist.Area = null; //TODO:合并脏区域
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
        let target = new InvalidWidget().Init(
            {
                Widget: widget,
                Action: action,
                Level: level,
                Area: item,
                RelayoutOnly: relayoutOnly
            });
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
                if (!item.RelayoutOnly) {
                    //注意: 以下重绘的是受影响Widget的上级，除非本身是根节点
                    InvalidQueue.RepaintWidget(context, affects.Widget.Parent ?? affects.Widget, affects.GetDirtyArea());
                }
            } else {
                InvalidQueue.RepaintWidget(context, item.Widget, item.Area);
            }
        }

        // clear items
        this._queue.Clear();

        // 通知重新进行HitTest TODO:确认布局影响，eg:Input重布局没有改变大小，则不需要重新HitTest
        if (hasRelayout)
            context.Window.RunNewHitTest();
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
        console.log(`InvalidQueue.Repaint: ${widget} rect=${dirtyArea?.GetRect()}`);
        let canvas = ctx.Canvas;

        //循环向上查找需要开始重绘的Widget(不透明的),并且计算裁剪区域
        let x = 0; //开始绘制的不透明的Widget相对于窗体的坐标
        let y = 0;
        let opaque: Nullable<PixUI.Widget> = null;
        let temp: PixUI.Widget = widget;
        let dirtyRect = (dirtyArea == null
            ? PixUI.Rect.FromLTWH(0, 0, widget.W, widget.H)
            : dirtyArea.GetRect()).Clone();
        let clipper: PixUI.IClipper = new PixUI.ClipperOfRect((dirtyRect).Clone());
        let isClipperEmpty = false;

        let dirtyX = dirtyRect.Left; //脏区域(重绘的Widget相对于Opaque Widget)
        let dirtyY = dirtyRect.Top;

        do {
            //查找开始绘制的Widget
            if (opaque == null) {
                if (temp.IsOpaque) //TODO:不能简单判断是否不透明，例如上级有OpacityWidget or ImageFilter等
                {
                    opaque = temp;
                    x = 0;
                    y = 0;
                } else {
                    dirtyX += temp.X;
                    dirtyY += temp.Y;
                }
            }

            //计算当前子级相对于上级的位置
            let cx = temp.X; //当前相对于上级的坐标
            let cy = temp.Y;
            if (PixUI.IsInterfaceOfIScrollable(temp.Parent)) //判断上级是否IScrollable,是则处理偏移量
            {
                const scrollable = temp.Parent;
                cx -= scrollable.ScrollOffsetX;
                cy -= scrollable.ScrollOffsetY;
            } else if (temp.Parent instanceof PixUI.Transform) //判断上级是否Transform,是则变换坐标
            {
                const transform = temp.Parent;
                let transformed = PixUI.MatrixUtils.TransformPoint(transform.EffectiveTransform, cx, cy);
                cx = transformed.Dx;
                cy = transformed.Dy;
            }

            //尝试获取当前的Clipper，并与现有的求交集
            let currentClipper = temp.Clipper;
            if (currentClipper != null) {
                clipper = currentClipper.IntersectWith(clipper);
                if (clipper.IsEmpty) {
                    isClipperEmpty = true;
                    break; //裁剪区域为空，不需要重绘
                }
            }

            clipper.Offset(cx, cy);

            x += cx;
            y += cy;
            if (temp.Parent == null)
                break;
            else
                temp = temp.Parent;
        } while (true);

        if (isClipperEmpty) {
            console.log("裁剪区域为空，不需要重绘");
            return;
        }

        if (opaque == null) //没找到指向RootWidget
        {
            opaque = temp;
            x = 0;
            y = 0;
        }

        //裁剪脏区域并开始绘制
        canvas.save();
        try {
            clipper.ApplyToCanvas(canvas); //必须在下句Translate之前
            canvas.translate(x, y);
            //判断是否RootWidget且非不透明，是则清空画布脏区域
            if ((opaque === ctx.Window.RootWidget) && !opaque.IsOpaque)
                canvas.clear(ctx.Window.BackgroundColor);
            if ((opaque === widget))
                opaque.Paint(canvas, dirtyArea);
            else
                opaque!.Paint(canvas, new PixUI.RepaintArea(PixUI.Rect.FromLTWH(dirtyX, dirtyY, dirtyRect.Width, dirtyRect.Height)));
        } catch (ex: any) {
            console.log(`InvalidQueue.RepaintWidget Error: ${ex.Message}`);
        } finally {
            clipper.Dispose();
            canvas.restore();
        }
    }
}
