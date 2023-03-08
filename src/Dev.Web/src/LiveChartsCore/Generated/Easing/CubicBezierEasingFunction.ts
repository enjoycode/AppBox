import * as System from '@/System'

export class CubicBezierEasingFunction {
    private static readonly s_iterations: number = 4;
    private static readonly s_minSlope: number = 0.001;
    private static readonly s_presicion: number = 0.0000001;
    private static readonly s_maxIterations: number = 10;

    private static readonly s_kSplineTableSize: number = 11;
    private static readonly s_kSampleStepSize: number = 1.0 / (CubicBezierEasingFunction.s_kSplineTableSize - 1.0);

    public static BuildBezierEasingFunction(mX1: number, mY1: number, mX2: number, mY2: number): System.Func2<number, number> {
        if (mX1 < 0 || mX1 > 1 || mX2 < 0 || mX2 > 1) {
            throw new System.Exception("Bezier x values must be in [0, 1] range");
        }

        if (mX1 == mY1 && mX2 == mY2) {
            return CubicBezierEasingFunction.LinearEasing;
        }


        let sampleValues = new Float32Array(CubicBezierEasingFunction.s_kSplineTableSize);
        for (let i = 0; i < CubicBezierEasingFunction.s_kSplineTableSize; ++i) {
            sampleValues[i] = CubicBezierEasingFunction.CalcBezier(i * CubicBezierEasingFunction.s_kSampleStepSize, mX1, mX2);
        }

        function getTForX(aX: number) {
            let intervalStart = 0.0;
            let currentSample = 1;
            let lastSample = CubicBezierEasingFunction.s_kSplineTableSize - 1;

            for (; currentSample != lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
                intervalStart += CubicBezierEasingFunction.s_kSampleStepSize;
            }
            --currentSample;


            let dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
            let guessForT = intervalStart + dist * CubicBezierEasingFunction.s_kSampleStepSize;

            let initialSlope = CubicBezierEasingFunction.GetSlope(guessForT, mX1, mX2);
            return initialSlope >= CubicBezierEasingFunction.s_minSlope
                ? CubicBezierEasingFunction.NewtonRaphsonIterate(aX, guessForT, mX1, mX2)
                : initialSlope == 0.0 ? guessForT : CubicBezierEasingFunction.BinarySubdivide(aX, intervalStart, intervalStart + CubicBezierEasingFunction.s_kSampleStepSize, mX1, mX2);
        }

        return (t) => {


            return CubicBezierEasingFunction.CalcBezier(getTForX(t), mY1, mY2);
        };
    }

    private static A(aA1: number, aA2: number): number {
        return 1.0 - 3.0 * aA2 + 3.0 * aA1;
    }

    private static B(aA1: number, aA2: number): number {
        return 3.0 * aA2 - 6.0 * aA1;
    }

    private static C(aA1: number): number {
        return 3.0 * aA1;
    }

    private static CalcBezier(aT: number, aA1: number, aA2: number): number {
        return ((CubicBezierEasingFunction.A(aA1, aA2) * aT + CubicBezierEasingFunction.B(aA1, aA2)) * aT + CubicBezierEasingFunction.C(aA1)) * aT;
    }

    private static GetSlope(aT: number, aA1: number, aA2: number): number {
        return 3.0 * CubicBezierEasingFunction.A(aA1, aA2) * aT * aT + 2.0 * CubicBezierEasingFunction.B(aA1, aA2) * aT + CubicBezierEasingFunction.C(aA1);
    }

    private static BinarySubdivide(aX: number, aA: number, aB: number, mX1: number, mX2: number): number {
        let currentX: number = 0;
        let currentT: number = 0;
        let i = 0;
        do {
            currentT = aA + (aB - aA) / 2.0;
            currentX = CubicBezierEasingFunction.CalcBezier(currentT, mX1, mX2) - aX;
            if (currentX > 0.0) {
                aB = currentT;
            } else {
                aA = currentT;
            }
        } while (Math.abs(currentX) > CubicBezierEasingFunction.s_presicion && ++i < CubicBezierEasingFunction.s_maxIterations);
        return currentT;
    }

    private static NewtonRaphsonIterate(aX: number, aGuessT: number, mX1: number, mX2: number): number {
        for (let i = 0; i < CubicBezierEasingFunction.s_iterations; ++i) {
            let currentSlope = CubicBezierEasingFunction.GetSlope(aGuessT, mX1, mX2);
            if (currentSlope == 0.0) {
                return aGuessT;
            }
            let currentX = CubicBezierEasingFunction.CalcBezier(aGuessT, mX1, mX2) - aX;
            aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
    }

    private static LinearEasing(x: number): number {
        return x;
    }
}
