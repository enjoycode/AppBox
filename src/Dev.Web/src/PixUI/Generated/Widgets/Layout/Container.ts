import * as PixUI from '@/PixUI'

export class Container extends PixUI.SingleChildWidget {
    public constructor() {
        super();
        this.IsLayoutTight = false; //暂默认布局时充满可用空间
    }

    private _color: Nullable<PixUI.State<PixUI.Color>>;

    public get IsOpaque(): boolean {
        return this._color != null && this._color.Value.Alpha == 0xFF;
    }

    public get Color(): Nullable<PixUI.State<PixUI.Color>> {
        return this._color;
    }

    public set Color(value: Nullable<PixUI.State<PixUI.Color>>) {
        this._color = this.Rebind(this._color, value, PixUI.BindingOptions.AffectsVisual);
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
