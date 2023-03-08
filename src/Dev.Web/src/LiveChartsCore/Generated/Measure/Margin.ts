export class Margin {
    public constructor(left: number, top: number, right: number, bottom: number) {
        this.Left = left;
        this.Top = top;
        this.Right = right;
        this.Bottom = bottom;
    }

    public static Empty(): Margin {
        return new Margin(0, 0, 0, 0);
    }

    public static All(all: number): Margin {
        return new Margin(all, all, all, all);
    }

    public static get Auto(): number {
        return NaN;
    }

    public Left: number = 0;

    public Top: number = 0;

    public Right: number = 0;

    public Bottom: number = 0;

    public static IsAuto(value: number): boolean {
        return Number.isNaN(value);
    }
}
