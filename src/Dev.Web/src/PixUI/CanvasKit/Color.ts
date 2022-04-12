import * as PixUI from '@/PixUI';

export class Color extends Float32Array {
    public static readonly Empty: Color = new Color(0);

    public constructor(value: number);
    public constructor(red: number, green: number, blue: number, alpha?: number);
    public constructor(a1: number, a2?: number, a3?: number, a4?: number) {
        super([0, 0, 0, 0]);
        if (a2 !== undefined && a3 !== undefined) {
            this[0] = Color.clamp(a1) / 255;
            this[1] = Color.clamp(a2) / 255;
            this[2] = Color.clamp(a3) / 255;
            this[3] = a4 === undefined ? 1 : Color.clamp(a4) / 255;
        } else {
            this[0] = ((a1 >> 16) & 0xFF) / 255;
            this[1] = ((a1 >> 8) & 0xFF) / 255;
            this[2] = (a1 & 0xFF) / 255;
            this[3] = ((a1 >> 24) & 0xFF) / 255;
        }
    }

    private static clamp(c: number) {
        return Math.round(Math.max(0, Math.min(c || 0, 255)));
    }

    public get obs() {
        return new PixUI.Rx<Color>(this);
    }

    public get Red() {
        return this[0] * 255;
    }

    public get Green() {
        return this[1] * 255;
    }

    public get Blue() {
        return this[2] * 255;
    }

    public get Alpha() {
        return this[3] * 255;
    }

    public WithAlpha(alpha: number): Color {
        return new Color(this.Red, this.Green, this.Blue, alpha);
    }

    public static Lerp(a: Nullable<Color>, b: Nullable<Color>, t: number): Nullable<Color> {
        return PixUI.ColorUtils.Lerp(a, b, t);
    }

}
