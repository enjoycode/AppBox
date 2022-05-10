import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Container extends PixUI.SingleChildWidget {
    private _color: Nullable<PixUI.State<PixUI.Color>>;
    private _padding: Nullable<PixUI.State<PixUI.EdgeInsets>>;

    public get IsOpaque(): boolean {
        return this._color != null && this._color.Value.Alpha == 0xFF;
    }

    public get Color(): Nullable<PixUI.State<PixUI.Color>> {
        return this._color;
    }

    public set Color(value: Nullable<PixUI.State<PixUI.Color>>) {
        this._color = this.Rebind(this._color, value, PixUI.BindingOptions.AffectsVisual);
    }

    public get Padding(): Nullable<PixUI.State<PixUI.EdgeInsets>> {
        return this._padding;
    }

    public set Padding(value: Nullable<PixUI.State<PixUI.EdgeInsets>>) {
        this._padding = this.Rebind(this._padding, value, PixUI.BindingOptions.AffectsLayout);
    }

    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        let padding = (this._padding?.Value ?? PixUI.EdgeInsets.All(0)).Clone();
        if (this.Child != null) {
            this.Child.Layout(width - padding.Left - padding.Right, height - padding.Top - padding.Bottom);
            this.Child.SetPosition(padding.Left, padding.Top);
        }

        this.SetSize(width, height);
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        if (this._color != null)
            canvas.drawRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), PixUI.PaintUtils.Shared(this._color.Value));

        this.PaintChildren(canvas, area);
    }

    public Init(props: Partial<Container>): Container {
        Object.assign(this, props);
        return this;
    }
}
