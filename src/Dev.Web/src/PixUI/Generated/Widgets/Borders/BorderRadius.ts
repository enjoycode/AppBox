import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class BorderRadius {
    public static readonly Empty: BorderRadius = BorderRadius.All(PixUI.Radius.Zero);


    public static All(radius: PixUI.Radius): BorderRadius {
        return new BorderRadius(radius, radius, radius, radius);
    }

    public static Circular(radius: number): BorderRadius {
        return BorderRadius.All(PixUI.Radius.Circular(radius));
    }

    public static Vertical(top: PixUI.Radius, bottom: PixUI.Radius): BorderRadius {
        return new BorderRadius(top, top, bottom, bottom);
    }

    public static Horizontal(left: PixUI.Radius, right: PixUI.Radius): BorderRadius {
        return new BorderRadius(left, right, left, right);
    }


    public readonly TopLeft: PixUI.Radius;
    public readonly TopRight: PixUI.Radius;
    public readonly BottomLeft: PixUI.Radius;
    public readonly BottomRight: PixUI.Radius;

    private constructor(topLeft: PixUI.Radius, topRight: PixUI.Radius, bottomLeft: PixUI.Radius, bottomRight: PixUI.Radius) {
        this.TopLeft = topLeft;
        this.TopRight = topRight;
        this.BottomLeft = bottomLeft;
        this.BottomRight = bottomRight;
    }

    public static Lerp(a: Nullable<BorderRadius>, b: Nullable<BorderRadius>, t: number): Nullable<BorderRadius> {
        if (a == null && b == null)
            return null;
        if (a == null)
            return BorderRadius.op_Multiply(b!, <number><any>t);
        if (b == null)
            return BorderRadius.op_Multiply(a, <number><any>(1.0 - t));

        return new BorderRadius(PixUI.Radius.Lerp(a.TopLeft, b.TopLeft, t)!, PixUI.Radius.Lerp(a.TopRight, b.TopRight, t)!, PixUI.Radius.Lerp(a.BottomLeft, b.BottomLeft, t)!, PixUI.Radius.Lerp(a.BottomRight, b.BottomRight, t)!);
    }

    public static op_Multiply(pt: BorderRadius, operand: number): BorderRadius {
        return new BorderRadius(PixUI.Radius.op_Multiply(pt.TopLeft, operand), PixUI.Radius.op_Multiply(pt.TopRight, operand), PixUI.Radius.op_Multiply(pt.BottomLeft, operand), PixUI.Radius.op_Multiply(pt.BottomRight, operand));
    }

    public ToRRect(rect: PixUI.Rect): PixUI.RRect {
        return PixUI.RRect.FromRectAndCorner(rect, this.TopLeft, this.TopRight, this.BottomLeft, this.BottomRight);
    }
}
