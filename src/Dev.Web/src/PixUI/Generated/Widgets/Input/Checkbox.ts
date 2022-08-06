import * as PixUI from '@/PixUI'

export class Checkbox extends PixUI.Toggleable {
    public constructor(value: PixUI.State<boolean>) {
        super();
        this._previousValue = value.Value;
        this.InitState(
            PixUI.RxComputed.Make1<boolean, Nullable<boolean>>(value, v => v, v => value.Value = v ?? false), false);
        this._positionController.StatusChanged.Add(this.OnPositionStatusChanged, this);
    }

    public static Tristate(value: PixUI.State<Nullable<boolean>>): Checkbox {
        let checkbox = new Checkbox(PixUI.State.op_Implicit_From(false));
        checkbox._previousValue = value.Value;
        checkbox.InitState(value, true); //replace to nullable state
        return checkbox;
    }

    private _previousValue: Nullable<boolean>;

    private _shape: PixUI.OutlinedBorder = new PixUI.RoundedRectangleBorder(null, PixUI.BorderRadius.All(PixUI.Radius.Circular(1.0)));

    private OnPositionStatusChanged(status: PixUI.AnimationStatus) {
        //暂在动画完成后更新缓存的旧值
        if (status == PixUI.AnimationStatus.Completed || status == PixUI.AnimationStatus.Dismissed)
            this._previousValue = this._value.Value;
    }


    private static readonly _kCheckboxSize: number = 30;
    private static readonly _kEdgeSize: number = 18;
    private static readonly _kStrokeWidth: number = 2.0;

    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        this.SetSize(Math.min(width, Checkbox._kCheckboxSize), Math.min(height, Checkbox._kCheckboxSize));
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        let origin = new PixUI.Offset(this.W / 2 - Checkbox._kEdgeSize / 2, this.H / 2 - Checkbox._kEdgeSize / 2);
        let checkColor = PixUI.Colors.White; //TODO:

        let status = this._positionController.Status;
        let tNormalized = status == PixUI.AnimationStatus.Forward || status == PixUI.AnimationStatus.Completed
            ? this._positionController.Value
            : 1.0 - this._positionController.Value;

        // Four cases: false to null, false to true, null to false, true to false
        if (this._previousValue == false || this._value.Value == false) {
            let t = this._value.Value == false ? 1.0 - tNormalized : tNormalized;
            let outer = Checkbox.OuterRectAt(origin, <number><unknown>t);
            let color = Checkbox.ColorAt(t);
            let paint = PixUI.PaintUtils.Shared(color);

            if (t <= 0.5) {
                let border = new PixUI.BorderSide(color, 2);
                this.DrawBox(canvas, outer, paint, border, false); //only draw border
            } else {
                this.DrawBox(canvas, outer, paint, null, true);
                let strokePaint = PixUI.PaintUtils.Shared(checkColor, CanvasKit.PaintStyle.Stroke, Checkbox._kStrokeWidth);
                let tShrink = (t - 0.5) * 2.0;
                if (this._previousValue == null || this._value.Value == null)
                    Checkbox.DrawDash(canvas, origin, tShrink, strokePaint);
                else
                    Checkbox.DrawCheck(canvas, origin, tShrink, strokePaint);
            }
        }
        // Two cases: null to true, true to null
        else {
            let outer = Checkbox.OuterRectAt(origin, 1.0);
            let paint = PixUI.PaintUtils.Shared(Checkbox.ColorAt(1.0));
            this.DrawBox(canvas, outer, paint, null, true);

            let strokePaint = PixUI.PaintUtils.Shared(checkColor, CanvasKit.PaintStyle.Stroke, Checkbox._kStrokeWidth);
            if (tNormalized <= 0.5) {
                let tShrink = 1.0 - tNormalized * 2.0;
                if (this._previousValue && this._previousValue)
                    Checkbox.DrawCheck(canvas, origin, tShrink, strokePaint);
                else
                    Checkbox.DrawDash(canvas, origin, tShrink, strokePaint);
            } else {
                let tExpand = (tNormalized - 0.5) * 2.0;
                if (this._value.Value != null && this._value.Value)
                    Checkbox.DrawCheck(canvas, origin, tExpand, strokePaint);
                else
                    Checkbox.DrawDash(canvas, origin, tExpand, strokePaint);
            }
        }
    }

    private DrawBox(canvas: PixUI.Canvas, outer: PixUI.Rect, paint: PixUI.Paint, side: Nullable<PixUI.BorderSide>, fill: boolean) {
        if (fill)
            canvas.drawPath(this._shape.GetOuterPath(outer), paint);
        if (side != null)
            this._shape.CopyWith(side).Paint(canvas, outer);
    }

    private static DrawCheck(canvas: PixUI.Canvas, origin: PixUI.Offset, t: number, paint: PixUI.Paint) {
        console.assert(t >= 0 && t <= 1.0);
        // As t goes from 0.0 to 1.0, animate the two check mark strokes from the
        // short side to the long side.
        let start = new PixUI.Offset(Checkbox._kEdgeSize * 0.15, Checkbox._kEdgeSize * 0.45);
        let mid = new PixUI.Offset(Checkbox._kEdgeSize * 0.4, Checkbox._kEdgeSize * 0.7);
        let end = new PixUI.Offset(Checkbox._kEdgeSize * 0.85, Checkbox._kEdgeSize * 0.25);


        if (t < 0.5) {
            let strokeT = t * 2.0;
            let drawMid = PixUI.Offset.Lerp(start, mid, strokeT)!;
            canvas.drawLine(origin.Dx + start.Dx, origin.Dy + start.Dy, origin.Dx + drawMid.Dx, origin.Dy + drawMid.Dy, paint);
            //path.MoveTo(origin.Dx + start.Dx, origin.Dy + start.Dy);
            //path.LineTo(origin.Dx + drawMid.Dx, origin.Dy + drawMid.Dy);
        } else {
            let strokeT = (t - 0.5) * 2.0;
            let drawEnd = PixUI.Offset.Lerp(mid, end, strokeT)!;
            canvas.drawLine(origin.Dx + start.Dx, origin.Dy + start.Dy, origin.Dx + mid.Dx + 0.8, origin.Dy + mid.Dy + 0.8, paint);
            canvas.drawLine(origin.Dx + mid.Dx, origin.Dy + mid.Dy, origin.Dx + drawEnd.Dx, origin.Dy + drawEnd.Dy, paint);

            //using var path = new Path(); //TODO: swapbuffer error on dx12
            //path.MoveTo(origin.Dx + start.Dx, origin.Dy + start.Dy);
            //path.LineTo(origin.Dx + mid.Dx, origin.Dy + mid.Dy);
            //path.LineTo(origin.Dx + drawEnd.Dx, origin.Dy + drawEnd.Dy);
            //path.FillType = SKPathFillType.InverseEvenOdd;
            //canvas.DrawPath(path, paint);
        }
    }

    private static DrawDash(canvas: PixUI.Canvas, origin: PixUI.Offset, t: number, paint: PixUI.Paint) {
        console.assert(t >= 0 && t <= 1.0);

        // As t goes from 0.0 to 1.0, animate the horizontal line from the
        // mid point outwards.
        let start = new PixUI.Offset(Checkbox._kEdgeSize * 0.2, Checkbox._kEdgeSize * 0.5);
        let mid = new PixUI.Offset(Checkbox._kEdgeSize * 0.5, Checkbox._kEdgeSize * 0.5);
        let end = new PixUI.Offset(Checkbox._kEdgeSize * 0.8, Checkbox._kEdgeSize * 0.5);

        let drawStart = PixUI.Offset.Lerp(start, mid, 1.0 - t)!;
        let drawEnd = PixUI.Offset.Lerp(mid, end, t)!;
        canvas.drawLine(origin.Dx + drawStart.Dx, origin.Dy + drawStart.Dy, origin.Dx + drawEnd.Dx, origin.Dy + drawEnd.Dy, paint);
    }

    private static OuterRectAt(origin: PixUI.Offset, t: number): PixUI.Rect {
        let inset = 1.0 - Math.abs(t - 0.5) * 2.0;
        let size = Checkbox._kEdgeSize - inset * Checkbox._kStrokeWidth;
        return PixUI.Rect.FromLTWH(origin.Dx + inset, origin.Dy + inset, size, size);
    }

    private static ColorAt(t: number): PixUI.Color {
        //TODO: fix activeColor and inactiveColor
        let activeColor = PixUI.Theme.AccentColor;
        let inactiveColor = new PixUI.Color(0x52000000);
        // As t goes from 0.0 to 0.25, animate from the inactiveColor to activeColor.
        return t >= 0.25 ? activeColor : PixUI.Color.Lerp(inactiveColor, activeColor, t * 4.0)!;
    }

    public Init(props: Partial<Checkbox>): Checkbox {
        Object.assign(this, props);
        return this;
    }

}
