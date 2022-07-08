import {Vector4} from "./Vector4";

// import {MatrixUtils} from "./MatrixUtils";

export class Matrix4 extends Float32Array {

    public static readonly Empty: Matrix4 = Matrix4.CreateEmpty();

    public constructor(m0: number, m1: number, m2: number, m3: number,
                       m4: number, m5: number, m6: number, m7: number,
                       m8: number, m9: number, m10: number, m11: number,
                       m12: number, m13: number, m14: number, m15: number) {
        super([m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15]);
    }

    public static CreateEmpty(): Matrix4 {
        return new Matrix4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }

    public static CreateIdentity(): Matrix4 {
        return new Matrix4(1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1);
    }

    public static CreateTranslation(x: number, y: number, z: number): Matrix4 {
        return new Matrix4(1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1);
    }

    public static CreateScale(x: number, y: number, z: number): Matrix4 {
        return new Matrix4(x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1);
    }

    public static TryInvert(other: Matrix4): Matrix4 | null {
        let res = Matrix4.CreateEmpty();
        let determinant = res.CopyInverse(other);
        return determinant == 0 ? null : res;
    }

    public Translate(x: number, y: number = 0, z: number = 0) {
        this[12] = this[0] * x + this[4] * y + this[8] * z + this[12];
        this[13] = this[1] * x + this[5] * y + this[9] * z + this[13];
        this[14] = this[2] * x + this[6] * y + this[10] * z + this[14];
        this[15] = this[3] * x + this[7] * y + this[11] * z + this[15];
    }

    public Scale(x: number, y: number = 1.0, z: number = 1.0) {
        this[0] *= x;
        this[1] *= x;
        this[2] *= x;
        this[3] *= x;
        this[4] *= y;
        this[5] *= y;
        this[6] *= y;
        this[7] *= y;
        this[8] *= z;
        this[9] *= z;
        this[10] *= z;
        this[11] *= z;
    }

    public RotateZ(angle: number) {
        let cosAngle = Math.cos(angle);
        let sinAngle = Math.sin(angle);
        let t1 = this[0] * cosAngle + this[4] * sinAngle;
        let t2 = this[1] * cosAngle + this[5] * sinAngle;
        let t3 = this[2] * cosAngle + this[6] * sinAngle;
        let t4 = this[3] * cosAngle + this[7] * sinAngle;
        let t5 = this[0] * -sinAngle + this[4] * cosAngle;
        let t6 = this[1] * -sinAngle + this[5] * cosAngle;
        let t7 = this[2] * -sinAngle + this[6] * cosAngle;
        let t8 = this[3] * -sinAngle + this[7] * cosAngle;
        this[0] = t1;
        this[1] = t2;
        this[2] = t3;
        this[3] = t4;
        this[4] = t5;
        this[5] = t6;
        this[6] = t7;
        this[7] = t8;
    }

    public Multiply(other: Matrix4) {
        let aM0 = this[0];
        let aM4 = this[4];
        let aM8 = this[8];
        let aM12 = this[12];
        let aM1 = this[1];
        let aM5 = this[5];
        let aM9 = this[9];
        let aM13 = this[13];
        let aM2 = this[2];
        let aM6 = this[6];
        let aM10 = this[10];
        let aM14 = this[14];
        let aM3 = this[3];
        let aM7 = this[7];
        let aM11 = this[11];
        let aM15 = this[15];

        let bM0 = other[0];
        let bM4 = other[4];
        let bM8 = other[8];
        let bM12 = other[12];
        let bM1 = other[1];
        let bM5 = other[5];
        let bM9 = other[9];
        let bM13 = other[13];
        let bM2 = other[2];
        let bM6 = other[6];
        let bM10 = other[10];
        let bM14 = other[14];
        let bM3 = other[3];
        let bM7 = other[7];
        let bM11 = other[11];
        let bM15 = other[15];
        this[0] = (aM0 * bM0) + (aM4 * bM1) + (aM8 * bM2) + (aM12 * bM3);
        this[4] = (aM0 * bM4) + (aM4 * bM5) + (aM8 * bM6) + (aM12 * bM7);
        this[8] = (aM0 * bM8) + (aM4 * bM9) + (aM8 * bM10) + (aM12 * bM11);
        this[12] = (aM0 * bM12) + (aM4 * bM13) + (aM8 * bM14) + (aM12 * bM15);
        this[1] = (aM1 * bM0) + (aM5 * bM1) + (aM9 * bM2) + (aM13 * bM3);
        this[5] = (aM1 * bM4) + (aM5 * bM5) + (aM9 * bM6) + (aM13 * bM7);
        this[9] = (aM1 * bM8) + (aM5 * bM9) + (aM9 * bM10) + (aM13 * bM11);
        this[13] = (aM1 * bM12) + (aM5 * bM13) + (aM9 * bM14) + (aM13 * bM15);
        this[2] = (aM2 * bM0) + (aM6 * bM1) + (aM10 * bM2) + (aM14 * bM3);
        this[6] = (aM2 * bM4) + (aM6 * bM5) + (aM10 * bM6) + (aM14 * bM7);
        this[10] = (aM2 * bM8) + (aM6 * bM9) + (aM10 * bM10) + (aM14 * bM11);
        this[14] = (aM2 * bM12) + (aM6 * bM13) + (aM10 * bM14) + (aM14 * bM15);
        this[3] = (aM3 * bM0) + (aM7 * bM1) + (aM11 * bM2) + (aM15 * bM3);
        this[7] = (aM3 * bM4) + (aM7 * bM5) + (aM11 * bM6) + (aM15 * bM7);
        this[11] = (aM3 * bM8) + (aM7 * bM9) + (aM11 * bM10) + (aM15 * bM11);
        this[15] = (aM3 * bM12) + (aM7 * bM13) + (aM11 * bM14) + (aM15 * bM15);
    }

    public PreConcat(other: Matrix4) {
        let res = other.Clone(); //传引用需要复制
        res.Multiply(this);
        this.CopyFrom(res);
    }

    public CopyInverse(other: Matrix4): number {
        let a00 = other[0];
        let a01 = other[1];
        let a02 = other[2];
        let a03 = other[3];
        let a10 = other[4];
        let a11 = other[5];
        let a12 = other[6];
        let a13 = other[7];
        let a20 = other[8];
        let a21 = other[9];
        let a22 = other[10];
        let a23 = other[11];
        let a30 = other[12];
        let a31 = other[13];
        let a32 = other[14];
        let a33 = other[15];
        let b00 = a00 * a11 - a01 * a10;
        let b01 = a00 * a12 - a02 * a10;
        let b02 = a00 * a13 - a03 * a10;
        let b03 = a01 * a12 - a02 * a11;
        let b04 = a01 * a13 - a03 * a11;
        let b05 = a02 * a13 - a03 * a12;
        let b06 = a20 * a31 - a21 * a30;
        let b07 = a20 * a32 - a22 * a30;
        let b08 = a20 * a33 - a23 * a30;
        let b09 = a21 * a32 - a22 * a31;
        let b10 = a21 * a33 - a23 * a31;
        let b11 = a22 * a33 - a23 * a32;
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (det == 0.0) {
            this.CopyFrom(other);
            return 0;
        }

        let invDet = 1.0 / det;
        this[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
        this[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
        this[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
        this[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
        this[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
        this[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
        this[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
        this[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
        this[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
        this[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
        this[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
        this[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
        this[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
        this[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
        this[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
        this[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;
        return det;
    }

    private CopyFrom(other: Matrix4) {
        for (let i = 0; i < 16; i++) {
            this[i] = other[i];
        }
    }

    public Clone(): Matrix4 {
        let clone = Matrix4.CreateEmpty();
        clone.CopyFrom(this);
        return clone;
    }

    private static GetIndex(row: number, col: number) {
        return col * 4 + row;
    }

    public SetRow(row: number, arg: Vector4) {
        this[Matrix4.GetIndex(row, 0)] = arg[0];
        this[Matrix4.GetIndex(row, 1)] = arg[1];
        this[Matrix4.GetIndex(row, 2)] = arg[2];
        this[Matrix4.GetIndex(row, 3)] = arg[3];
    }

    public SetColumn(column: number, arg: Vector4) {
        let entry = column * 4;
        this[entry + 3] = arg[3];
        this[entry + 2] = arg[2];
        this[entry + 1] = arg[1];
        this[entry] = arg[0];
    }

    public TransponseTo(): Matrix4 {
        return new Matrix4(
            this[0], this[4], this[8], this[12],
            this[1], this[5], this[9], this[13],
            this[2], this[6], this[10], this[14],
            this[3], this[7], this[11], this[15]
        );
    }

    public static op_Equality(a: Matrix4, b: Matrix4): boolean {
        for (let i = 0; i < 16; i++) {
            if (a[i] != b[i]) return false;
        }
        return true;
    }

}
