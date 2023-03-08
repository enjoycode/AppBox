export class CircleEasingFunction {
    public static In(t: number): number {
        {
            return <number><unknown>(1 - Math.sqrt(1 - t * t));
        }
    }

    public static Out(t: number): number {
        {
            return <number><unknown>Math.sqrt(1 - (--t * t));
        }
    }

    public static InOut(t: number): number {
        return <number><unknown>((t *= 2) <= 1 ? 1 - Math.sqrt(1 - t * t) : Math.sqrt(1 - (t -= 2) * t) + 1) / 2;
    }
}
