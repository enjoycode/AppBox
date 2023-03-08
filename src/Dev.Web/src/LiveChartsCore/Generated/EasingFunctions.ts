import * as LiveChartsCore from '@/LiveChartsCore'
import * as System from '@/System'

export class EasingFunctions {
    public static get BackIn(): System.Func2<number, number> {
        return t => LiveChartsCore.BackEasingFunction.In(t);
    }

    public static get BackOut(): System.Func2<number, number> {
        return t => LiveChartsCore.BackEasingFunction.Out(t);
    }

    public static get BackInOut(): System.Func2<number, number> {
        return t => LiveChartsCore.BackEasingFunction.InOut(t);
    }

    public static get BounceIn(): System.Func2<number, number> {
        return LiveChartsCore.BounceEasingFunction.In;
    }

    public static get BounceOut(): System.Func2<number, number> {
        return LiveChartsCore.BounceEasingFunction.Out;
    }

    public static get BounceInOut(): System.Func2<number, number> {
        return LiveChartsCore.BounceEasingFunction.InOut;
    }

    public static get CircleIn(): System.Func2<number, number> {
        return LiveChartsCore.CircleEasingFunction.In;
    }

    public static get CircleOut(): System.Func2<number, number> {
        return LiveChartsCore.CircleEasingFunction.Out;
    }

    public static get CircleInOut(): System.Func2<number, number> {
        return LiveChartsCore.CircleEasingFunction.InOut;
    }

    public static get CubicIn(): System.Func2<number, number> {
        return LiveChartsCore.CubicEasingFunction.In;
    }

    public static get CubicOut(): System.Func2<number, number> {
        return LiveChartsCore.CubicEasingFunction.Out;
    }

    public static get CubicInOut(): System.Func2<number, number> {
        return LiveChartsCore.CubicEasingFunction.InOut;
    }

    public static get Ease(): System.Func2<number, number> {
        return EasingFunctions.BuildCubicBezier(0.25, 0.1, 0.25, 1);
    }

    public static get EaseIn(): System.Func2<number, number> {
        return EasingFunctions.BuildCubicBezier(0.42, 0, 1, 1);
    }

    public static get EaseOut(): System.Func2<number, number> {
        return EasingFunctions.BuildCubicBezier(0, 0, 0.58, 1);
    }

    public static get EaseInOut(): System.Func2<number, number> {
        return EasingFunctions.BuildCubicBezier(0.42, 0, 0.58, 1);
    }

    public static get ElasticIn(): System.Func2<number, number> {
        return t => LiveChartsCore.ElasticEasingFunction.In(t);
    }

    public static get ElasticOut(): System.Func2<number, number> {
        return t => LiveChartsCore.ElasticEasingFunction.Out(t);
    }

    public static get ElasticInOut(): System.Func2<number, number> {
        return t => LiveChartsCore.ElasticEasingFunction.InOut(t);
    }

    public static get ExponentialIn(): System.Func2<number, number> {
        return LiveChartsCore.ExponentialEasingFunction.In;
    }

    public static get ExponentialOut(): System.Func2<number, number> {
        return LiveChartsCore.ExponentialEasingFunction.Out;
    }

    public static get ExponentialInOut(): System.Func2<number, number> {
        return LiveChartsCore.ExponentialEasingFunction.InOut;
    }

    public static get Lineal(): System.Func2<number, number> {
        return t => t;
    }

    public static get PolinominalIn(): System.Func2<number, number> {
        return t => LiveChartsCore.PolinominalEasingFunction.In(t);
    }

    public static get PolinominalOut(): System.Func2<number, number> {
        return t => LiveChartsCore.PolinominalEasingFunction.Out(t);
    }

    public static get PolinominalInOut(): System.Func2<number, number> {
        return t => LiveChartsCore.PolinominalEasingFunction.InOut(t);
    }

    public static get QuadraticIn(): System.Func2<number, number> {
        return t => t * t;
    }

    public static get QuadraticOut(): System.Func2<number, number> {
        return t => t * (2 - t);
    }

    public static get QuadraticInOut(): System.Func2<number, number> {
        return t => ((t *= 2) <= 1 ? t * t : --t * (2 - t) + 1) / 2;
    }

    public static get SinIn(): System.Func2<number, number> {
        return t => +t == 1 ? 1 : <number><unknown>(1 - Math.cos(t * Math.PI / 2));
    }

    public static get SinOut(): System.Func2<number, number> {
        return t => <number><unknown>Math.sin(t * Math.PI / 2);
    }

    public static get SinInOut(): System.Func2<number, number> {
        return t => <number><unknown>(1 - Math.cos(Math.PI * t)) / 2;
    }

    public static get BuildFunctionUsingKeyFrames(): System.Func2<LiveChartsCore.KeyFrame[], System.Func2<number, number>> {
        return keyFrames => {
            if (keyFrames.length < 2) throw new System.Exception("At least 2 key frames are required.");
            if (keyFrames[keyFrames.length - 1].Time < 1) {
                let newKeyFrames = new System.List<LiveChartsCore.KeyFrame>(keyFrames).Init(
                    [
                        new LiveChartsCore.KeyFrame().Init(
                            {
                                Time: 1,
                                Value: keyFrames[keyFrames.length - 1].Value
                            })
                    ]);
                keyFrames = newKeyFrames.ToArray();
            }

            return t => {
                let i = 0;
                let current = keyFrames[i];
                let next = keyFrames[i + 1];

                while (next.Time < t && i < keyFrames.length - 2) {
                    i++;
                    current = keyFrames[i];
                    next = keyFrames[i + 1];
                }

                let dt = next.Time - current.Time;
                let dv = next.Value - current.Value;

                let p = (t - current.Time) / dt;

                return current.Value + next.EasingFunction(p) * dv;
            };
        };
    }

    public static get BuildCustomBackIn(): System.Func2<number, System.Func2<number, number>> {
        return overshoot => t => LiveChartsCore.BackEasingFunction.In(t, overshoot);
    }

    public static get BuildCustomBackOut(): System.Func2<number, System.Func2<number, number>> {
        return overshoot => t => LiveChartsCore.BackEasingFunction.Out(t, overshoot);
    }

    public static get BuildCustomBackInOut(): System.Func2<number, System.Func2<number, number>> {
        return overshoot => t => LiveChartsCore.BackEasingFunction.InOut(t, overshoot);
    }

    public static get BuildCustomElasticIn(): System.Func3<number, number, System.Func2<number, number>> {
        return (amplitude, period) => t => LiveChartsCore.ElasticEasingFunction.In(t, amplitude, period);
    }

    public static get BuildCustomElasticOut(): System.Func3<number, number, System.Func2<number, number>> {
        return (amplitude, period) => t => LiveChartsCore.ElasticEasingFunction.Out(t, amplitude, period);
    }

    public static get BuildCustomElasticInOut(): System.Func3<number, number, System.Func2<number, number>> {
        return (amplitude, period) => t => LiveChartsCore.ElasticEasingFunction.InOut(t, amplitude, period);
    }

    public static get BuildCustomPolinominalIn(): System.Func2<number, System.Func2<number, number>> {
        return exponent => t => LiveChartsCore.PolinominalEasingFunction.In(t, exponent);
    }

    public static get BuildCustomPolinominalOut(): System.Func2<number, System.Func2<number, number>> {
        return exponent => t => LiveChartsCore.PolinominalEasingFunction.Out(t, exponent);
    }

    public static get BuildCustomPolinominalInOut(): System.Func2<number, System.Func2<number, number>> {
        return exponent => t => LiveChartsCore.PolinominalEasingFunction.InOut(t, exponent);
    }

    public static get BuildCubicBezier(): System.Func5<number, number, number, number, System.Func2<number, number>> {
        return (mX1, mY1, mX2, mY2) => LiveChartsCore.CubicBezierEasingFunction.BuildBezierEasingFunction(mX1, mY1, mX2, mY2);
    }
}
