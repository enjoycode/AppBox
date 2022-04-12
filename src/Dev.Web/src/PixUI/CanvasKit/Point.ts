export class Point extends Float32Array {

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

    public get Y() {
        return this[1];
    }

    public Offset(dx: number, dy: number) {
        this[0] += dx;
        this[1] += dy;
    }

}
