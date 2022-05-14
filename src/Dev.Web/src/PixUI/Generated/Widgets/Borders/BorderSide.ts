import * as PixUI from '@/PixUI'

export enum BorderStyle {
    None,
    Solid
}

export class BorderSide {
    public static readonly Empty: BorderSide = new BorderSide((PixUI.Color.Empty).Clone(), 0, BorderStyle.None);

    public readonly Color: PixUI.Color;
    public readonly Width: number;
    public readonly Style: BorderStyle;

    public constructor(color: PixUI.Color, width: number = 1, style: BorderStyle = BorderStyle.Solid) {
        this.Color = (color).Clone();
        this.Width = width;
        this.Style = style;
    }

    public ApplyPaint(paint: PixUI.Paint) {
        paint.setStyle(CanvasKit.PaintStyle.Stroke);
        paint.setColor(this.Style == BorderStyle.Solid ? this.Color : PixUI.Color.Empty);
        paint.setStrokeWidth(this.Style == BorderStyle.Solid ? this.Width : 0);
    }

    public Lerp(a: BorderSide, b: BorderSide, t: number): BorderSide {
        if (t == 0) return a;
        // ReSharper disable once CompareOfFloatsByEqualityOperator
        if (t == 1) return b;
        let width = PixUI.FloatUtils.Lerp(a.Width, b.Width, t);
        if (width < 0)
            return BorderSide.Empty;
        if (a.Style == b.Style)
            return new BorderSide((PixUI.Color.Lerp((a.Color).Clone(), (b.Color).Clone(), t)!).Clone(), width, a.Style);

        let colorA = (a.Style == BorderStyle.Solid ? a.Color : a.Color.WithAlpha(0)).Clone();
        let colorB = (b.Style == BorderStyle.Solid ? b.Color : b.Color.WithAlpha(0)).Clone();
        return new BorderSide((PixUI.Color.Lerp((colorA).Clone(), (colorB).Clone(), t)!).Clone(), width);
    }

    public Clone(): BorderSide {
        return new BorderSide((this.Color).Clone(), this.Width, this.Style);
    }
}
