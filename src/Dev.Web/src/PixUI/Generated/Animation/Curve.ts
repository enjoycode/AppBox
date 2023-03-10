import * as System from '@/System'

export abstract class ParametricCurve<T> {
    public Transform(t: number): T {
        console.assert(t >= 0.0 && t <= 1.0);
        return this.TransformInternal(t);
    }

    protected TransformInternal(t: number): T {
        throw new System.NotSupportedException();
    }
}

export abstract class Curve extends ParametricCurve<number> {
    public get Flipped(): Curve {
        return new FlippedCurve(this);
    }

    Transform(t: number): number {
        if (t == 0.0 || t == 1.0) return t;

        return super.Transform(t);
    }
}

export class Linear extends Curve {
    TransformInternal(t: number): number {
        return t;
    }
}

export class BounceInOutCurve extends Curve {
    TransformInternal(t: number): number {
        if (t < 0.5)
            return (1.0 - Curves.Bounce(1.0 - t * 2.0)) * 0.5;
        return Curves.Bounce(t * 2.0 - 1.0) * 0.5 + 0.5;
    }
}

export class FlippedCurve extends Curve {
    public readonly Curve: Curve;

    public constructor(curve: Curve) {
        super();
        this.Curve = curve;
    }

    TransformInternal(t: number): number {
        return 1.0 - this.Curve.Transform(1.0 - t);
    }
}

export class Interval extends Curve {
    private readonly _begin: number;

    private readonly _end: number;

    private readonly _curve: Curve;

    public constructor(begin: number, end: number, curve: Nullable<Curve> = null) {
        super();
        if (!(begin >= 0 && begin <= 1 && end >= 0 && end <= 1 && end >= begin))
            throw new System.ArgumentOutOfRangeException();

        this._begin = begin;
        this._end = end;
        this._curve = curve ?? Curves.Linear;
    }

    TransformInternal(t: number): number {
        t = clamp((t - this._begin) / (this._end - this._begin), 0, 1);
        if (t == 0.0 || t == 1.0)
            return t;
        return this._curve.Transform(t);
    }
}

export class SawTooth extends Curve {
    public constructor(count: number) {
        super();
        this._count = count;
    }

    // The number of repetitions of the sawtooth pattern in the unit interval.
    private readonly _count: number;

    TransformInternal(t: number): number {
        t *= this._count;
        return t - Math.trunc(t);
    }
}

export class Cubic extends Curve {
    private static readonly CubicErrorBound: number = 0.001;

    private readonly _a: number;
    private readonly _b: number;
    private readonly _c: number;
    private readonly _d: number;

    public constructor(a: number, b: number, c: number, d: number) {
        super();
        this._a = a;
        this._b = b;
        this._c = c;
        this._d = d;
    }

    private static EvaluateCubic(a: number, b: number, m: number): number {
        return 3 * a * (1 - m) * (1 - m) * m +
            3 * b * (1 - m) * m * m +
            m * m * m;
    }

    TransformInternal(t: number): number {
        let start = 0.0;
        let end = 1.0;
        while (true) {
            let midpoint = (start + end) / 2;
            let estimate = Cubic.EvaluateCubic(this._a, this._c, midpoint);
            if (Math.abs(t - estimate) < Cubic.CubicErrorBound)
                return Cubic.EvaluateCubic(this._b, this._d, midpoint);
            if (estimate < t)
                start = midpoint;
            else
                end = midpoint;
        }
    }
}

export class Curves {
    public static readonly Linear: Curve = new Linear();

    public static readonly BounceInOut: Curve = new BounceInOutCurve();

    public static readonly EaseInOutCubic: Cubic = new Cubic(0.645, 0.045, 0.355, 1.0);

    public static readonly FastOutSlowIn: Cubic = new Cubic(0.4, 0.0, 0.2, 1.0);

    public static Bounce(t: number): number {
        if (t < 1.0 / 2.75) {
            return 7.5625 * t * t;
        }

        if (t < 2 / 2.75) {
            t -= 1.5 / 2.75;
            return 7.5625 * t * t + 0.75;
        }

        if (t < 2.5 / 2.75) {
            t -= 2.25 / 2.75;
            return 7.5625 * t * t + 0.9375;
        }

        t -= 2.625 / 2.75;
        return 7.5625 * t * t + 0.984375;
    }
}
