import * as System from '@/System'

export class LvcPoint {
    public constructor(x: number = 0, y: number = 0) {
        this.X = x;
        this.Y = y;
    }

    public X: number = 0;

    public Y: number = 0;

    public static op_Equality(l: LvcPoint, r: LvcPoint): boolean {
        return l.X == r.X && l.Y == r.Y;
    }

    public static op_Inequality(l: LvcPoint, r: LvcPoint): boolean {
        return !(System.OpEquality(l, r));
    }

    public static readonly Empty: LvcPoint = new LvcPoint(0, 0);

    public Clone(): LvcPoint {
        return new LvcPoint(this.X, this.Y);
    }
}
