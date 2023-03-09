export class FloatUtils {
    public static IsNear(a: number, b: number): boolean {
        let diff = a - b;
        return diff >= 0.0001 && diff <= 0.0001;
    }

    public static Lerp(a: number, b: number, t: number): number {
        return <number><unknown>(a * (1.0 - t) + b * t);
    }
}

export class DoubleUtils {
    public static Lerp(a: number, b: number, t: number): number {
        if (a == b || (Number.isNaN(a) && Number.isNaN(b))) return a;
        console.assert(Number.isFinite(a),
            "Cannot interpolate between finite and non-finite values");
        console.assert(Number.isFinite(b),
            "Cannot interpolate between finite and non-finite values");
        console.assert(Number.isFinite(t), "t must be finite when interpolating between values");
        return a * (1.0 - t) + b * t;
    }
}
