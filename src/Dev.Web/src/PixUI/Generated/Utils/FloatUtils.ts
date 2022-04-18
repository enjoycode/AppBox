import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class FloatUtils {
    public static IsNear(a: number, b: number): boolean {
        let diff = a - b;
        return diff >= 0.0001 && diff <= 0.0001;
    }

    public static Lerp(a: number, b: number, t: number): number {
        return <number><unknown>(a * (1.0 - t) + b * t);
    }
}
