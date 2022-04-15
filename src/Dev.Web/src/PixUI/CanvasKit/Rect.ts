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

    public ContainsPoint(x: number, y: number): boolean {
        return x >= this.Left && x < this.Right && y >= this.Top && y < this.Bottom;
    }

    public Offset(x: number, y: number): void {
        this[0] += x;
        this[1] += y;
    }

    public IntersectsWith(x: number, y: number, w: number, h: number): boolean {
        return this.Left < (x + w) && this.Right > x && this.Top < (y + h) && this.Bottom > y;
    }

}
