export class ElasticEasingFunction {
    private static readonly tau: number = <number><unknown>(2 * Math.PI);

    public static In(t: number, a: number = 1, p: number = 0.3): number {
        let s = Math.asin(1 / (a = Math.max(1, a))) * (p /= ElasticEasingFunction.tau);
        {
            return <number><unknown>(a * ElasticEasingFunction.Tpmt(-(--t)) * Math.sin((s - t) / p));
        }
    }

    public static Out(t: number, a: number = 1, p: number = 0.3): number {
        let s = Math.asin(1 / (a = Math.max(1, a))) * (p /= ElasticEasingFunction.tau);
        {
            return <number><unknown>(1 - a * ElasticEasingFunction.Tpmt(t = +t) * Math.sin((t + s) / p));
        }
    }

    public static InOut(t: number, a: number = 1, p: number = 0.3): number {
        let s = Math.asin(1 / (a = Math.max(1, a))) * (p /= ElasticEasingFunction.tau);
        {
            return (t = t * 2 - 1) < 0
                ? <number><unknown>(a * ElasticEasingFunction.Tpmt(-t) * Math.sin((s - t) / p))
                : <number><unknown>(2 - a * ElasticEasingFunction.Tpmt(t) * Math.sin((s + t) / p)) / 2;
        }
    }

    private static Tpmt(x: number): number {
        {
            return <number><unknown>((Math.pow(2, -10 * x) - 0.0009765625) * 1.0009775171065494);
        }
    }
}
