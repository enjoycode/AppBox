import {Matrix4} from "./Matrix4";
import {Offset} from "@/PixUI";

export class MatrixUtils {

    public static GetAsTranslation(transform: Matrix4): Nullable<Offset> {
        if (transform[0] == 1 &&
            transform[1] == 0 &&
            transform[2] == 0 &&
            transform[3] == 0 &&
            transform[4] == 0 &&
            transform[5] == 1 &&
            transform[6] == 0 &&
            transform[7] == 0 &&
            transform[8] == 0 &&
            transform[9] == 0 &&
            transform[10] == 1 &&
            transform[11] == 0 &&
            transform[14] == 0 &&
            transform[15] == 1) {
            return new Offset(transform[12], transform[13]);
        }

        return null;
    }

    public static TransformPoint(transform: Matrix4, x: number, y: number): Offset {
        // Directly simulate the transform of the vector (x, y, 0, 1),
        // dropping the resulting Z coordinate, and normalizing only if needed.

        let rx = transform[0] * x + transform[4] * y + transform[12];
        let ry = transform[1] * x + transform[5] * y + transform[13];
        let rw = transform[3] * x + transform[7] * y + transform[15];

        return rw == 1.0 ? new Offset(rx, ry) : new Offset(rx / rw, ry / rw);
    }
}
