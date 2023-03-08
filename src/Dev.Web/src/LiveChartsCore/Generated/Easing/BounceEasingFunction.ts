export class BounceEasingFunction {
    private static readonly s_b1: number = 4 / 11;
    private static readonly s_b2: number = 6 / 11;
    private static readonly s_b3: number = 8 / 11;
    private static readonly s_b4: number = 3 / 4;
    private static readonly s_b5: number = 9 / 11;
    private static readonly s_b6: number = 10 / 11;
    private static readonly s_b7: number = 15 / 16;
    private static readonly s_b8: number = 21 / 22;
    private static readonly s_b9: number = 63 / 64;
    private static readonly s_b0: number = 1 / BounceEasingFunction.s_b1 / BounceEasingFunction.s_b1;

    public static In(t: number): number {
        return 1 - BounceEasingFunction.Out(1 - t);
    }

    public static Out(t: number): number {
        return (t = +t) < BounceEasingFunction.s_b1
            ? BounceEasingFunction.s_b0 * t * t : t < BounceEasingFunction.s_b3 ? BounceEasingFunction.s_b0 * (t -= BounceEasingFunction.s_b2) * t + BounceEasingFunction.s_b4 : t < BounceEasingFunction.s_b6 ? BounceEasingFunction.s_b0 * (t -= BounceEasingFunction.s_b5) * t + BounceEasingFunction.s_b7
                : BounceEasingFunction.s_b0 * (t -= BounceEasingFunction.s_b8) * t + BounceEasingFunction.s_b9;
    }

    public static InOut(t: number): number {
        return ((t *= 2) <= 1 ? 1 - BounceEasingFunction.Out(1 - t) : BounceEasingFunction.Out(t - 1) + 1) / 2;
    }
}
