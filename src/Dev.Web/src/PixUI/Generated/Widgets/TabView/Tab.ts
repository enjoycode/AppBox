import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Tab extends PixUI.SingleChildWidget implements PixUI.IMouseRegion {
    private static readonly $meta_PixUI_IMouseRegion = true;
    public readonly IsSelected: PixUI.State<boolean> = PixUI.State.op_Implicit_From(false);
    private readonly _scrollable: boolean;
    private _isHover: boolean = false;
    #MouseRegion: PixUI.MouseRegion;
    public get MouseRegion() {
        return this.#MouseRegion;
    }

    private set MouseRegion(value) {
        this.#MouseRegion = value;
    }

    public set OnTap(value: System.Action<PixUI.PointerEvent>) {
        this.MouseRegion.PointerTap.Add(value, this);
    }

    public constructor(scrollable: boolean) {
        super();
        this._scrollable = scrollable;
        this.MouseRegion = new PixUI.MouseRegion(() => PixUI.Cursors.Hand);
        this.MouseRegion.HoverChanged.Add(this._OnHoverChanged, this);
    }

    private _OnHoverChanged(hover: boolean) {
        this._isHover = hover;
        this.Invalidate(PixUI.InvalidAction.Repaint);
    }

    public HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        if (!this.ContainsPoint(x, y)) return false;

        result.Add(this);
        return true; //Don't hit test child
    }

    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        this.Child!.Layout(width, height);

        if (this._scrollable) {
            this.SetSize(this.Child.W, height);
            this.Child.SetPosition(0, (height - this.Child.H) / 2);
        } else {
            this.SetSize(width, height);
            this.Child.SetPosition((width - this.Child.W) / 2, (height - this.Child.H) / 2);
        }
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        if (this._isHover) {
            let color = new PixUI.Color(0xFF2090EA);
            let paint = PixUI.PaintUtils.Shared(color);
            canvas.drawRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), paint);
        }

        canvas.translate(this.Child!.X, this.Child.Y);
        this.Child.Paint(canvas, area);
        canvas.translate(-this.Child.X, -this.Child.Y);
    }

    public Init(props: Partial<Tab>): Tab {
        Object.assign(this, props);
        return this;
    }
}
