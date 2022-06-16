import * as PixUI from '@/PixUI'

export abstract class View extends PixUI.SingleChildWidget {
    private _bgBgColor: Nullable<PixUI.State<PixUI.Color>>;

    public get BgColor(): Nullable<PixUI.State<PixUI.Color>> {
        return this._bgBgColor;
    }

    public set BgColor(value: Nullable<PixUI.State<PixUI.Color>>) {
        this._bgBgColor = this.Rebind(this._bgBgColor, value, PixUI.BindingOptions.AffectsVisual);
    }

    public get IsOpaque(): boolean {
        return this._bgBgColor != null && this._bgBgColor.Value.IsOpaque;
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        if (this._bgBgColor != null)
            canvas.drawRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), PixUI.PaintUtils.Shared(this._bgBgColor.Value));

        this.PaintChildren(canvas, area);
    }
}
