import * as PixUI from '@/PixUI'
import * as System from '@/System'

export class Radius implements System.IEquatable<Radius> {
    private static readonly $meta_System_IEquatable = true;
    public static readonly Empty: Radius = new Radius(0, 0);

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

            let k = <number><unknown>(1.0 - t);
            return Radius.Elliptical(a.X * k, a.Y * k);
        }

        if (a == null)
            return Radius.Elliptical(<number><unknown>(b.X * t), <number><unknown>(b.Y * t));
        return Radius.Elliptical(PixUI.FloatUtils.Lerp(a.X, b.X, t),
            PixUI.FloatUtils.Lerp(a.Y, b.Y, t));
    }

    public static op_Multiply(pt: Radius, operand: number): Radius {
        return new Radius(pt.X * operand, pt.Y * operand);
    }

    public Equals(other: Radius): boolean {
        return this.X == other.X && this.Y == other.Y;
    }

    public Clone(): Radius {
        return new Radius(this.X, this.Y);
    }
}
