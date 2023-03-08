export class BackEasingFunction {
    public static In(t: number, s: number = 1.70158): number {
        return t * t * (s * (t - 1) + t);
    }

    public static Out(t: number, s: number = 1.70158): number {
        return --t * t * ((t + 1) * s + t) + 1;
    }

    public static InOut(t: number, s: number = 1.70158): number {
        return ((t *= 2) < 1 ? t * t * ((s + 1) * t - s) : (t -= 2) * t * ((s + 1) * t + s) + 2) / 2;
    }
}
