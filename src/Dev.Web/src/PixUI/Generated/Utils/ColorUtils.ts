import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class ColorUtils {
    private static ScaleAlpha(a: PixUI.Color, factor: number): PixUI.Color {
        let alpha = clamp(<number><any>Math.round(a.Alpha * factor), 0, 255);
        return a.WithAlpha(alpha);
    }

    private static LerpInt(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    public static Lerp(a: Nullable<PixUI.Color>, b: Nullable<PixUI.Color>, t: number): Nullable<PixUI.Color> {
        if (b == null)
            return a == null ? null : ColorUtils.ScaleAlpha(a, 1.0 - t);

        if (a == null) return ColorUtils.ScaleAlpha(b, t);

        let red = clamp(<number><any>ColorUtils.LerpInt(a.Red, b.Red, t), 0, 255);
        let green = clamp(<number><any>ColorUtils.LerpInt(a.Green, b.Green, t), 0, 255);
        let blue = clamp(<number><any>ColorUtils.LerpInt(a.Blue, b.Blue, t), 0, 255);
        let alpha = clamp(<number><any>ColorUtils.LerpInt(a.Alpha, b.Alpha, t), 0, 255);
        return new PixUI.Color(red, green, blue, alpha);
    }
}
