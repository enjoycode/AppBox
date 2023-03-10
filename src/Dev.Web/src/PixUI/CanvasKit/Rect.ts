export class Rect extends Float32Array {
    public static readonly Empty: Rect = new Rect();

    public constructor();
    public constructor(left: number, top: number, right: number, bottom: number);
    public constructor(left?: number, top?: number, right?: number, bottom?: number) {
        super([0, 0, 0, 0]);
        if (left !== undefined && top !== undefined && right !== undefined && bottom !== undefined) {
            this[0] = left;
            this[1] = top;
            this[2] = right;
            this[3] = bottom;
        }
    }

    public static FromLTWH(left: number, top: number, width: number, height: number): Rect {
        return new Rect(left, top, width + left, height + top);
    }

    public static FromFloat32Array(array: Float32Array): Rect {
        return new Rect(array[0], array[1], array[2], array[3]);
    }

    public get Left() {
        return this[0];
    }

    public get Top() {
        return this[1];
    }

    public get Right() {
        return this[2];
    }

    public get Bottom() {
        return this[3];
    }

    public get Width() {
        return this[2] - this[0];
    }

    public get Height() {
        return this[3] - this[1];
    }

    public get MidX() {
        return this.Left + (this.Width / 2);
    }

    public get MidY() {
        return this.Top + (this.Height / 2);
    }

    public get IsEmpty(): boolean {
        return Rect.op_Equality(this, Rect.Empty);
    }

    public ContainsPoint(x: number, y: number): boolean {
        return x >= this.Left && x < this.Right && y >= this.Top && y < this.Bottom;
    }

    public Offset(x: number, y: number): void {
        this[0] += x;
        this[1] += y;
        this[2] += x;
        this[3] += y;
    }

    public IntersectTo(other: Rect): void {
        if (!this.IntersectsWith(other.Left, other.Top, other.Width, other.Height)) {
            this[0] = 0;
            this[1] = 0;
            this[2] = 0;
            this[3] = 0;
            return;
        }

        this[0] = Math.max(this.Left, other.Left);
        this[1] = Math.max(this.Top, other.Top);
        this[2] = Math.min(this.Right, other.Right);
        this[3] = Math.min(this.Bottom, other.Bottom);
    }

    public IntersectsWith(x: number, y: number, w: number, h: number): boolean {
        return this.Left < (x + w) && this.Right > x && this.Top < (y + h) && this.Bottom > y;
    }

    public Clone(): Rect {
        return new Rect(this.Left, this.Top, this.Right, this.Bottom);
    }

    public static op_Equality(a: Rect, b: Rect): boolean {
        return a.Left === b.Left && a.Top === b.Top && a.Right === b.Right && a.Bottom === b.Bottom;
    }

}
