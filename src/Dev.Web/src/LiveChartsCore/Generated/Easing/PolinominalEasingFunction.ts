export class PolinominalEasingFunction {
    public static In(t: number, e: number = 3): number {
        {
            return <number><unknown>Math.pow(t, e);
        }
    }

    public static Out(t: number, e: number = 3): number {
        {
            return <number><unknown>(1 - Math.pow(1 - t, e));
        }
    }

    public static InOut(t: number, e: number = 3): number {
        {
            return <number><unknown>((t *= 2) <= 1 ? Math.pow(t, e) : 2 - Math.pow(2 - t, e)) / 2;
        }
    }
}
