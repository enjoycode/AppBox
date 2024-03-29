export class Point extends Float32Array {

    public static readonly Empty = new Point();

    public constructor();
    public constructor(x: number, y: number);
    public constructor(x?: number, y?: number) {
        super([0, 0]);
        if (x !== undefined && y !== undefined) {
            this[0] = x;
            this[1] = y;
        }
    }

    public get X() {
        return this[0];
    }

    public set X(value) {
        this[0] = value;
    }

    public get Y() {
        return this[1];
    }

    public set Y(value) {
        this[1] = value;
    }

    public Offset(dx: number, dy: number) {
        this[0] += dx;
        this[1] += dy;
    }

    public Clone(): Point {
        return new Point(this.X, this.Y);
    }

    public static op_Equality(a: Point, b: Point): boolean {
        return a.X === b.X && a.Y === b.Y;
    }

}
