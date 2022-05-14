import * as PixUI from '@/PixUI'

export class ColorUtils {
    private static ScaleAlpha(a: PixUI.Color, factor: number): PixUI.Color {
        let alpha = clamp((Math.floor(Math.round(a.Alpha * factor)) & 0xFF), 0, 255);
        return a.WithAlpha(alpha);
    }

    private static LerpInt(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    public static Lerp(a: Nullable<PixUI.Color>, b: Nullable<PixUI.Color>, t: number): Nullable<PixUI.Color> {
        if (b == null)
            return a == null ? null : ColorUtils.ScaleAlpha((a).Clone(), 1.0 - t);

        if (a == null) return ColorUtils.ScaleAlpha((b).Clone(), t);

        let red = clamp((Math.floor(ColorUtils.LerpInt(a.Red, b.Red, t)) & 0xFF), 0, 255);
        let green = clamp((Math.floor(ColorUtils.LerpInt(a.Green, b.Green, t)) & 0xFF), 0, 255);
        let blue = clamp((Math.floor(ColorUtils.LerpInt(a.Blue, b.Blue, t)) & 0xFF), 0, 255);
        let alpha = clamp((Math.floor(ColorUtils.LerpInt(a.Alpha, b.Alpha, t)) & 0xFF), 0, 255);
        return new PixUI.Color(red, green, blue, alpha);
    }
}
