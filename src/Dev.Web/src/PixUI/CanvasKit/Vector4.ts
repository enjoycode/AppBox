export class Vector4 extends Float32Array {

    public constructor(v1: number, v2: number, v3: number, v4: number) {
        super([v1, v2, v3, v4]);
    }

    public Clone(): Vector4 {
        return new Vector4(this[0], this[1], this[2], this[3]);
    }

}
