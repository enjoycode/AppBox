import * as System from '@/System'

export class LvcSize {
    public constructor(width: number = 0, height: number = 0) {
        this.Width = width;
        this.Height = height;
    }

    public Width: number = 0;

    public Height: number = 0;

    public static op_Equality(left: LvcSize, right: LvcSize): boolean {
        return left.Width == right.Width && left.Height == right.Height;
    }

    public static op_Inequality(left: LvcSize, right: LvcSize): boolean {
        return !(System.OpEquality(left, right));
    }

    public static readonly Empty: LvcSize = new LvcSize(0, 0);

    public Clone(): LvcSize {
        return new LvcSize(this.Width, this.Height);
    }
}
