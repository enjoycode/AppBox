import {Rect} from "./Rect";
import {Radius} from "@/PixUI";

export class RRect extends Float32Array {


    public static FromRectAndCorner(rect: Rect, topLeft: Nullable<Radius> = null, topRight: Nullable<Radius> = null,
                                    bottomLeft: Nullable<Radius> = null, bottomRight: Nullable<Radius> = null): RRect {
        let res = new RRect();
        res[0] = rect.Left;
        res[1] = rect.Top;
        res[2] = rect.Right;
        res[3] = rect.Bottom;
        res.SetRadius(4, topLeft);
        res.SetRadius(6, topRight);
        res.SetRadius(8, bottomRight);
        res.SetRadius(10, bottomLeft);
        return res;
    }

    public static FromRectAndRadius(rect: Rect, radiusX: number, radiusY: number) {
        let res = new RRect();
        res[0] = rect.Left;
        res[1] = rect.Top;
        res[2] = rect.Right;
        res[3] = rect.Bottom;
        res[4] = radiusX;
        res[5] = radiusY;
        res[6] = radiusX;
        res[7] = radiusY;
        res[8] = radiusX;
        res[9] = radiusY;
        res[10] = radiusX;
        res[11] = radiusY;
        return res;
    }

    public static FromCopy(from: RRect): RRect {
        let res = new RRect();
        for (let i = 0; i < 12; i++) {
            res[i] = from[i];
        }
        return res;
    }

    public constructor() {
        super([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }

    private SetRadius(index: number, radius: Nullable<Radius>) {
        if (radius != null) {
            this[index] = radius.X;
            this[index + 1] = radius.Y;
        }
    }

    public Inflate(dx: number, dy: number) {
        this[0] -= dx;
        this[1] -= dy;
        this[2] += dx;
        this[3] += dy;

        this[4] += dx;
        this[5] += dy;
        this[6] += dx;
        this[7] += dy;
        this[8] += dx;
        this[9] += dy;
        this[10] += dx;
        this[11] += dy;
    }

    public Deflate(dx: number, dy: number) {
        this.Inflate(-dx, -dy);
    }

}
