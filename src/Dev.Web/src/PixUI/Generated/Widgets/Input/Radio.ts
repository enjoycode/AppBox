import * as PixUI from '@/PixUI'

export class Radio extends PixUI.Toggleable {
    public constructor(value: PixUI.State<boolean>) {
        super();
        this.InitState(PixUI.RxComputed.Make1<boolean, Nullable<boolean>>(value,
                v => v,
                v => value.Value = v ?? false),
            false);
    }


    private static readonly _kRadioSize: number = 30;
    private static readonly _kOuterRadius: number = 8;
    private static readonly _kInnerRadius: number = 4.5;

    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        this.SetSize(Math.min(width, Radio._kRadioSize), Math.min(height, Radio._kRadioSize));
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        let center = new PixUI.Offset(this.W / 2, this.H / 2);

        let activeColor = PixUI.Theme.AccentColor;
        let inactiveColor = new PixUI.Color(0x52000000);
        let color = PixUI.Color.Lerp(inactiveColor, activeColor, this._positionController.Value);

        // outer circle
        let paint = PixUI.PaintUtils.Shared(color, CanvasKit.PaintStyle.Stroke, 2);
        paint.setAntiAlias(true);
        canvas.drawCircle(center.Dx, center.Dy, Radio._kOuterRadius, paint);

        // inner circle
        if (!this._positionController.IsDismissed) {
            paint.setStyle(CanvasKit.PaintStyle.Fill);
            canvas.drawCircle(center.Dx, center.Dy,
                <number><unknown>(Radio._kInnerRadius * this._positionController.Value), paint);
        }
    }

}
