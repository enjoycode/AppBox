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

    public set OnTap(value: System.Action1<PixUI.PointerEvent>) {
        this.MouseRegion.PointerTap.Add(value, this);
    }

    public constructor(scrollable: boolean) {
        super();
        this._scrollable = scrollable;
        this.MouseRegion = new PixUI.MouseRegion(() => PixUI.Cursors.Hand, false);
        this.MouseRegion.HoverChanged.Add(this._OnHoverChanged, this);

        this.Bind(this.IsSelected, PixUI.BindingOptions.AffectsVisual); //TODO:待TabBar实现指示器后移除
    }

    private _OnHoverChanged(hover: boolean) {
        this._isHover = hover;
        if (!this.IsSelected.Value) //已选中的不需要重绘
            this.Invalidate(PixUI.InvalidAction.Repaint);
    }

    // protected internal override bool HitTest(float x, float y, HitTestResult result)
    // {
    //     if (!ContainsPoint(x, y)) return false;
    //
    //     result.Add(this);
    //     return true; //Don't hit test child
    // }

    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        if (this.Child == null) {
            this.SetSize(0, 0);
            return;
        }

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
        if (!this.IsSelected.Value && this._isHover) {
            let color = new PixUI.Color(0xFF2090EA); //TODO: HoverColor
            let paint = PixUI.PaintUtils.Shared(color);
            canvas.drawRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), paint);
        }

        if (this.Child == null) return;

        canvas.translate(this.Child!.X, this.Child.Y);
        this.Child.Paint(canvas, area?.ToChild(this.Child.X, this.Child.Y));
        canvas.translate(-this.Child.X, -this.Child.Y);

        //TODO:暂在这里画指示器，待TabBar实现后移除
        if (this.IsSelected.Value)
            canvas.drawRect(PixUI.Rect.FromLTWH(0, this.H - 4, this.W, 4), PixUI.PaintUtils.Shared(PixUI.Theme.FocusedColor));
    }

    public Init(props: Partial<Tab>): Tab {
        Object.assign(this, props);
        return this;
    }
}
