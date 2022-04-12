import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Radius implements System.IEquatable<Radius> {
    public static readonly Zero: Radius = new Radius(0, 0);

    public static Circular(radius: number): Radius {
        return new Radius(radius, radius);
    }

    public static Elliptical(x: number, y: number): Radius {
        return new Radius(x, y);
    }

    public readonly X: number;

    public readonly Y: number;

    private constructor(x: number, y: number) {
        this.X = x;
        this.Y = y;
    }

    public static Lerp(a: Nullable<Radius>, b: Nullable<Radius>, t: number): Nullable<Radius> {
        if (b == null) {
            if (a == null) return null;

            let k = <number><any>(1.0 - t);
            return Radius.Elliptical(a.X * k, a.Y * k);
        }

        if (a == null)
            return Radius.Elliptical(<number><any>(b.X * t), <number><any>(b.Y * t));
        return Radius.Elliptical(PixUI.FloatUtils.Lerp(a.X, b.X, t), PixUI.FloatUtils.Lerp(a.Y, b.Y, t));
    }

    public static op_Multiply(pt: Radius, operand: number): Radius {
        return new Radius(pt.X * operand, pt.Y * operand);
    }

    public Equals(other: Radius): boolean {
        return this.X == other.X && this.Y == other.Y;
    }
}
