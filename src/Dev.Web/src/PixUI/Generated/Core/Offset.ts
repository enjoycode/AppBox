import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Offset implements System.IEquatable<Offset> {
    public static readonly Zero: Offset = new Offset(0, 0);

    public readonly Dx: number;
    public readonly Dy: number;

    public constructor(dx: number, dy: number) {
        this.Dx = dx;
        this.Dy = dy;
    }

    public static Lerp(a: Nullable<Offset>, b: Nullable<Offset>, t: number): Nullable<Offset> {
        if (b == null) {
            if (a == null)
                return null;
            return new Offset(<number><any>(a.Dx * (1.0 - t)), <number><any>(a.Dy * (1.0 - t)));
        }

        if (a == null)
            return new Offset(<number><any>(b.Dx * t), <number><any>(b.Dy * t));

        return new Offset(PixUI.FloatUtils.Lerp(a.Dx, b.Dx, t), PixUI.FloatUtils.Lerp(a.Dy, b.Dy, t));
    }

    public Equals(other: Offset): boolean {
        return this.Dx == other.Dx && this.Dy == other.Dy;
    }


    public static op_Equality(left: Offset, right: Offset): boolean {
        return left.Equals(right);
    }

    public static op_Inequality(left: Offset, right: Offset): boolean {
        return !left.Equals(right);
    }

    public ToString(): string {
        return `{{Dx=${this.Dx}, Dy=${this.Dy}}}`;
    }
}
