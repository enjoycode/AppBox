export class ExponentialEasingFunction {
    public static In(t: number): number {
        return ExponentialEasingFunction.Tpmt(1 - +t);
    }

    public static Out(t: number): number {
        return 1 - ExponentialEasingFunction.Tpmt(t);
    }

    public static InOut(t: number): number {
        return ((t *= 2) <= 1 ? ExponentialEasingFunction.Tpmt(1 - t) : 2 - ExponentialEasingFunction.Tpmt(t - 1)) / 2;
    }

    private static Tpmt(x: number): number {
        {
            return <number><unknown>((Math.pow(2, -10 * x) - 0.0009765625) * 1.0009775171065494);
        }
    }
}
