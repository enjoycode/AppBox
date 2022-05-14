import * as System from '@/System'
import * as PixUI from '@/PixUI'

export abstract class InputBorder extends PixUI.ShapeBorder {
    #BorderSide: PixUI.BorderSide = PixUI.BorderSide.Empty;
    public get BorderSide() {
        return this.#BorderSide;
    }

    protected set BorderSide(value) {
        this.#BorderSide = value;
    }

    public get Dimensions(): PixUI.EdgeInsets {
        return PixUI.EdgeInsets.All(this.BorderSide.Width);
    }

    public constructor(borderSide: Nullable<PixUI.BorderSide>) {
        super();
        this.BorderSide = borderSide ?? PixUI.BorderSide.Empty;
    }
}

export class OutlineInputBorder extends InputBorder {
    #BorderRadius: PixUI.BorderRadius = PixUI.BorderRadius.Empty;
    public get BorderRadius() {
        return this.#BorderRadius;
    }

    private set BorderRadius(value) {
        this.#BorderRadius = value;
    }

    #GapPadding: number = 0;
    public get GapPadding() {
        return this.#GapPadding;
    }

    private set GapPadding(value) {
        this.#GapPadding = value;
    }

    public constructor(borderSide: Nullable<PixUI.BorderSide> = null, borderRadius: Nullable<PixUI.BorderRadius> = null, gapPadding: number = 4.0) {
        super(borderSide ?? new PixUI.BorderSide(new PixUI.Color(0xFF9B9B9B)));
        if (gapPadding < 0)
            throw new System.ArgumentOutOfRangeException("gapPadding");

        this.BorderRadius = borderRadius ?? PixUI.BorderRadius.All(PixUI.Radius.Circular(4.0));
        this.GapPadding = gapPadding;
    }

    public GetOuterPath(rect: PixUI.Rect): PixUI.Path {
        throw new System.NotImplementedException();
    }

    public GetInnerPath(rect: PixUI.Rect): PixUI.Path {
        throw new System.NotImplementedException();
    }

    public LerpTo(to: Nullable<PixUI.ShapeBorder>, tween: PixUI.ShapeBorder, t: number) {
        if (to instanceof OutlineInputBorder) {
            const other = to;
            let temp = <OutlineInputBorder><unknown>tween;
            temp.BorderRadius = PixUI.BorderRadius.Lerp(this.BorderRadius, other.BorderRadius, t)!;
            temp.BorderSide = this.BorderSide.Lerp(this.BorderSide, other.BorderSide, t);
            temp.GapPadding = other.GapPadding;
        } else {
            super.LerpTo(to, tween, t);
        }
    }

    public Clone(): PixUI.ShapeBorder {
        return new OutlineInputBorder(this.BorderSide, this.BorderRadius, this.GapPadding);
    }

    public Paint(canvas: PixUI.Canvas, rect: PixUI.Rect) {
        let paint = PixUI.PaintUtils.Shared();
        this.BorderSide.ApplyPaint(paint);
        paint.setAntiAlias(true); //TODO: no radius no need

        let outer = this.BorderRadius.ToRRect((rect).Clone());
        outer.Deflate(this.BorderSide.Width / 2, this.BorderSide.Width / 2);
        canvas.drawRRect(outer, paint);
    }

    public Init(props: Partial<OutlineInputBorder>): OutlineInputBorder {
        Object.assign(this, props);
        return this;
    }
}
