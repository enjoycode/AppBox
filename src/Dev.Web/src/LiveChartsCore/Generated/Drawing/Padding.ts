export class Padding {
    public constructor(left: number, top: number, right: number, bottom: number) {
        this.Left = <number><unknown>left;
        this.Top = <number><unknown>top;
        this.Right = <number><unknown>right;
        this.Bottom = <number><unknown>bottom;
    }

    public static All(padding: number): Padding {
        return new Padding(padding, padding, padding, padding);
    }

    public static readonly Default: Padding = new Padding(0, 0, 0, 0);

    public Left: number = 0;

    public Right: number = 0;

    public Top: number = 0;

    public Bottom: number = 0;
}
