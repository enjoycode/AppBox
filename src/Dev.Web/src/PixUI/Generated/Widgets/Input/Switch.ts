import * as PixUI from '@/PixUI'

export class Switch extends PixUI.Toggleable {
    public constructor(value: PixUI.State<boolean>) {
        super();
        this.InitState(PixUI.RxComputed.Make1<boolean, Nullable<boolean>>(value, v => v, v => value.Value = v ?? false), false);
    }


    private static readonly _kTrackWidth: number = 40;
    private static readonly _kTrackHeight: number = 24;
    private static readonly _kTrackRadius: number = Switch._kTrackHeight / 2.0;
    private static readonly _kTrackInnerStart: number = Switch._kTrackHeight / 2.0;
    private static readonly _kTrackInnerEnd: number = Switch._kTrackWidth - Switch._kTrackInnerStart;
    private static readonly _kSwitchWidth: number = Switch._kTrackWidth + 6;
    private static readonly _kSwitchHeight: number = Switch._kTrackHeight + 6;

    // private const float _kTrackInnerLength = _kTrackInnerEnd - _kTrackInnerStart;

    private static readonly _kThumbExtension: number = 7;
    private static readonly _kThumbRadius: number = Switch._kTrackHeight / 2 - 2;
    private static readonly _kThumbBorderColor: PixUI.Color = new PixUI.Color(0x0A000000);

    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        this.SetSize(Math.min(width, Switch._kSwitchWidth), Math.min(height, Switch._kSwitchHeight));
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        canvas.save();
        canvas.translate(0, (Switch._kSwitchHeight - Switch._kTrackHeight) / 2);

        let currentValue = this._positionController.Value;
        let currentReactionValue = 0;
        let visualPosition = currentValue;

        let activeColor = PixUI.Theme.AccentColor;
        let trackColor = new PixUI.Color(0x52000000);
        let paint = PixUI.PaintUtils.Shared(PixUI.Color.Lerp(trackColor, activeColor, currentValue));
        paint.setAntiAlias(true);

        // track
        let trackRect = PixUI.Rect.FromLTWH(
            (this.W - Switch._kTrackWidth) / 2, (this.H - Switch._kSwitchHeight) / 2, Switch._kTrackWidth, Switch._kTrackHeight
        );
        let trackRRect = PixUI.RRect.FromRectAndRadius((trackRect).Clone(), Switch._kTrackRadius, Switch._kTrackRadius);
        canvas.drawRRect(trackRRect, paint);

        // thumb
        let currentThumbExtension = Switch._kThumbExtension * currentReactionValue;
        let thumbLeft = PixUI.FloatUtils.Lerp(
            trackRect.Left + Switch._kTrackInnerStart - Switch._kThumbRadius, trackRect.Left + Switch._kTrackInnerEnd - Switch._kThumbRadius - currentThumbExtension, visualPosition
        );
        let thumbRight = PixUI.FloatUtils.Lerp(
            trackRect.Left + Switch._kTrackInnerStart + Switch._kThumbRadius + currentThumbExtension, trackRect.Left + Switch._kTrackInnerEnd + Switch._kThumbRadius, visualPosition
        );
        let thumbCenterY = Switch._kTrackHeight / 2.0;
        let thumbBounds = new PixUI.Rect(thumbLeft, thumbCenterY - Switch._kThumbRadius, thumbRight, thumbCenterY + Switch._kThumbRadius);

        let clipPath = new CanvasKit.Path();
        clipPath.addRRect(trackRRect);
        canvas.clipPath(clipPath, CanvasKit.ClipOp.Intersect, true);

        Switch.PaintThumb(canvas, (thumbBounds).Clone());

        canvas.restore();
    }

    private static PaintThumb(canvas: PixUI.Canvas, rect: PixUI.Rect) {
        let shortestSide = Math.min(rect.Width, rect.Height);
        let rrect = PixUI.RRect.FromRectAndRadius((rect).Clone(), shortestSide / 2, shortestSide / 2);

        let paint = PixUI.PaintUtils.Shared(PixUI.Color.Empty);
        paint.setAntiAlias(true);

        // shadow
        rrect.Shift(0, 3);
        let shadowColor = new PixUI.Color(0x26000000);
        let blurRadius = 8.0;
        paint.setColor(shadowColor);
        paint.setMaskFilter(CanvasKit.MaskFilter.MakeBlur(CanvasKit.BlurStyle.Normal, PixUI.ConvertRadiusToSigma(blurRadius), false));
        canvas.drawRRect(rrect, paint);

        shadowColor = new PixUI.Color(0x0F000000);
        blurRadius = 1;
        paint.setColor(shadowColor);
        paint.setMaskFilter(CanvasKit.MaskFilter.MakeBlur(CanvasKit.BlurStyle.Normal, PixUI.ConvertRadiusToSigma(blurRadius), false));
        canvas.drawRRect(rrect, paint);
        rrect.Shift(0, -3);

        // border and fill
        rrect.Inflate(0.5, 0.5);
        paint.setColor(Switch._kThumbBorderColor);
        paint.setMaskFilter(null);
        canvas.drawRRect(rrect, paint);
        rrect.Deflate(0.5, 0.5);

        paint.setColor(PixUI.Colors.White);
        canvas.drawRRect(rrect, paint);
    }

    public Init(props: Partial<Switch>): Switch {
        Object.assign(this, props);
        return this;
    }

}
