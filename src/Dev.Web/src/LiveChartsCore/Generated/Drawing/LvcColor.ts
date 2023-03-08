import * as System from '@/System'

export class LvcColor {
    public constructor(red: number, green: number, blue: number, alpha: number = 255) {
        this.R = red;
        this.G = green;
        this.B = blue;
        this.A = alpha;
    }

    public static get Empty(): LvcColor {
        return new LvcColor(255, 255, 255, 0);
    }

    public R: number = 0;

    public G: number = 0;

    public B: number = 0;

    public A: number = 0;

    public static op_Equality(left: LvcColor, right: LvcColor): boolean {
        return left.R == right.R && left.G == right.G && left.B == right.B && left.A == right.A;
    }

    public static op_Inequality(left: LvcColor, right: LvcColor): boolean {
        return !(System.OpEquality(left, right));
    }

    public static FromArgb(alpha: number, red: number, green: number, blue: number): LvcColor {
        return new LvcColor(red, green, blue, alpha);
    }

    public static FromColorWithAlpha(alpha: number, color: LvcColor): LvcColor {
        return new LvcColor(color.R, color.G, color.B, alpha);
    }

    public Clone(): LvcColor {
        return new LvcColor(this.R, this.G, this.B, this.A);
    }
}
