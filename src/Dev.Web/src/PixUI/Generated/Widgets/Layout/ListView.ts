import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class ListView extends PixUI.MultiChildWidget implements PixUI.IScrollable {
    private static readonly $meta_PixUI_IScrollable = true;
    private readonly _scrollController: PixUI.ScrollController;

    public constructor(controller: Nullable<PixUI.ScrollController> = null) {
        super();
        this._scrollController = controller ?? new PixUI.ScrollController(PixUI.ScrollDirection.Vertical);
    }

    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        let y: number = 0;
        for (const child of this._children) {
            child.Layout(width, Number.MAX_VALUE);
            // child.W = width;
            child.SetPosition(0, y);
            y += child.H;
        }

        this.SetSize(width, height);
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        canvas.save();
        canvas.clipRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), CanvasKit.ClipOp.Intersect, false);

        let offset = this._scrollController.OffsetY;
        for (const child of this._children) {
            if (child.Y + child.H <= offset) continue;

            canvas.translate(0, child.Y - offset);
            child.Paint(canvas, null);
            canvas.translate(0, offset - child.Y);
        }

        canvas.restore();
    }

    public get ScrollOffsetX(): number {
        return this._scrollController.OffsetX;
    }

    public get ScrollOffsetY(): number {
        return this._scrollController.OffsetY;
    }

    public OnScroll(dx: number, dy: number) {
        this._scrollController.OnScroll(dx, dy);
        this.Invalidate(PixUI.InvalidAction.Repaint);
    }

    public Init(props: Partial<ListView>): ListView {
        Object.assign(this, props);
        return this;
    }
}
