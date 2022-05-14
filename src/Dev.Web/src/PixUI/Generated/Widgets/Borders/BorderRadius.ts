import * as PixUI from '@/PixUI'

export class BorderRadius {
    public static readonly Empty: BorderRadius = BorderRadius.All((PixUI.Radius.Empty).Clone());


    public static All(radius: PixUI.Radius): BorderRadius {
        return new BorderRadius((radius).Clone(), (radius).Clone(), (radius).Clone(), (radius).Clone());
    }

    public static Circular(radius: number): BorderRadius {
        return BorderRadius.All(PixUI.Radius.Circular(radius));
    }

    public static Vertical(top: PixUI.Radius, bottom: PixUI.Radius): BorderRadius {
        return new BorderRadius((top).Clone(), (top).Clone(), (bottom).Clone(), (bottom).Clone());
    }

    public static Horizontal(left: PixUI.Radius, right: PixUI.Radius): BorderRadius {
        return new BorderRadius((left).Clone(), (right).Clone(), (left).Clone(), (right).Clone());
    }


    public readonly TopLeft: PixUI.Radius;
    public readonly TopRight: PixUI.Radius;
    public readonly BottomLeft: PixUI.Radius;
    public readonly BottomRight: PixUI.Radius;

    private constructor(topLeft: PixUI.Radius, topRight: PixUI.Radius, bottomLeft: PixUI.Radius, bottomRight: PixUI.Radius) {
        this.TopLeft = (topLeft).Clone();
        this.TopRight = (topRight).Clone();
        this.BottomLeft = (bottomLeft).Clone();
        this.BottomRight = (bottomRight).Clone();
    }

    public static Lerp(a: Nullable<BorderRadius>, b: Nullable<BorderRadius>, t: number): Nullable<BorderRadius> {
        if (a == null && b == null)
            return null;
        if (a == null)
            return BorderRadius.op_Multiply(b!, <number><unknown>t);
        if (b == null)
            return BorderRadius.op_Multiply(a, <number><unknown>(1.0 - t));

        return new BorderRadius((PixUI.Radius.Lerp((a.TopLeft).Clone(), (b.TopLeft).Clone(), t)!).Clone(), (PixUI.Radius.Lerp((a.TopRight).Clone(), (b.TopRight).Clone(), t)!).Clone(), (PixUI.Radius.Lerp((a.BottomLeft).Clone(), (b.BottomLeft).Clone(), t)!).Clone(), (PixUI.Radius.Lerp((a.BottomRight).Clone(), (b.BottomRight).Clone(), t)!).Clone());
    }

    public static op_Multiply(pt: BorderRadius, operand: number): BorderRadius {
        return new BorderRadius((PixUI.Radius.op_Multiply(pt.TopLeft, operand)).Clone(), (PixUI.Radius.op_Multiply(pt.TopRight, operand)).Clone(), (PixUI.Radius.op_Multiply(pt.BottomLeft, operand)).Clone(), (PixUI.Radius.op_Multiply(pt.BottomRight, operand)).Clone());
    }

    public ToRRect(rect: PixUI.Rect): PixUI.RRect {
        return PixUI.RRect.FromRectAndCorner((rect).Clone(), (this.TopLeft).Clone(), (this.TopRight).Clone(), (this.BottomLeft).Clone(), (this.BottomRight).Clone());
    }

    public Clone(): BorderRadius {
        return new BorderRadius((this.TopLeft).Clone(), (this.TopRight).Clone(), (this.BottomLeft).Clone(), (this.BottomRight).Clone());
    }
}
