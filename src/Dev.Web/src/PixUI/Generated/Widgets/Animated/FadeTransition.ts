import * as PixUI from '@/PixUI'

export class FadeTransition extends PixUI.SingleChildWidget {
    private readonly _opacity: PixUI.Animation<number>;

    public constructor(opacity: PixUI.Animation<number>) {
        super();
        this._opacity = opacity;
    }

    Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        if (this._opacity.Value == 0 || this.Child == null)
            return;

        let alpha = (Math.floor((255 * this._opacity.Value)) & 0xFF);
        let paint = PixUI.PaintUtils.Shared(new PixUI.Color(0, 0, 0, alpha));
        let rect = PixUI.Rect.FromLTWH(this.Child.X, this.Child.Y, this.Child.W, this.Child.H);
        canvas.saveLayer(paint, rect);

        this.PaintChildren(canvas, area);

        canvas.restore();
    }
}
