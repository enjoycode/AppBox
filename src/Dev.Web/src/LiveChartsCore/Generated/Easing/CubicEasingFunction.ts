export class CubicEasingFunction {
    public static In(t: number): number {
        return t * t * t;
    }

    public static Out(t: number): number {
        return --t * t * t + 1;
    }

    public static InOut(t: number): number {
        return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
    }
}
