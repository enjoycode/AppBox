export class Size {
    public readonly Width: number;
    public readonly Height: number;

    public constructor(width: number, height: number) {
        this.Width = width;
        this.Height = height;
    }

    public Clone(): Size {
        return new Size(this.Width, this.Height);
    }

    public static op_Equality(a: Size, b: Size): boolean {
        if (a === b) return true;
        return a.Width == b.Width && a.Height == b.Height;
    }
}
