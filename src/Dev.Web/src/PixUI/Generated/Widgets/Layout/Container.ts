import * as PixUI from '@/PixUI'

export class Container extends PixUI.SingleChildWidget {
    public constructor() {
        super();
        this.IsLayoutTight = false; //暂默认布局时充满可用空间
    }

    private _bgColor: Nullable<PixUI.State<PixUI.Color>>;

    get IsOpaque(): boolean {
        return this._bgColor != null && this._bgColor.Value.IsOpaque;
    }

    public get BgColor(): Nullable<PixUI.State<PixUI.Color>> {
        return this._bgColor;
    }

    public set BgColor(value: Nullable<PixUI.State<PixUI.Color>>) {
        this._bgColor = this.Rebind(this._bgColor, value, PixUI.BindingOptions.AffectsVisual);
    }

    Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        if (this._bgColor != null)
            canvas.drawRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), PixUI.PaintUtils.Shared(this._bgColor.Value));

        this.PaintChildren(canvas, area);
    }
}
