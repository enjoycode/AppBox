import * as System from '@/System'

export class LvcPointD {
    public constructor(x: number = 0, y: number = 0) {
        this.X = x;
        this.Y = y;
    }

    public X: number = 0;

    public Y: number = 0;

    public static op_Equality(l: LvcPointD, r: LvcPointD): boolean {
        return l.X == r.X && l.Y == r.Y;
    }

    public static op_Inequality(l: LvcPointD, r: LvcPointD): boolean {
        return !(System.OpEquality(l, r));
    }

    public static readonly Empty: LvcPointD = (new LvcPointD(0, 0)).Clone();

    public Clone(): LvcPointD {
        return new LvcPointD(this.X, this.Y);
    }
}
