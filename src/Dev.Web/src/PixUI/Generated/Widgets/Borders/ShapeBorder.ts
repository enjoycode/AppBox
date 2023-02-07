import * as PixUI from '@/PixUI'
/// <summary>
/// Base class for shape outlines.
/// </summary>
export abstract class ShapeBorder {
    public abstract get Dimensions(): PixUI.EdgeInsets ;


    /// <summary>
    /// Create a [Path] that describes the outer edge of the border.
    /// </summary>
    public abstract GetOuterPath(rect: PixUI.Rect): PixUI.Path ;

    /// <summary>
    /// Create a [Path] that describes the inner edge of the border.
    /// </summary>
    public abstract GetInnerPath(rect: PixUI.Rect): PixUI.Path ;

    public LerpTo(to: Nullable<ShapeBorder>, tween: ShapeBorder, t: number) {
        //TODO: if (b == null) ScaleTo(1.0 - t)
    }

    /// <summary>
    /// Paints the border within the given [Rect] on the given [Canvas].
    /// </summary>
    public abstract Paint(canvas: PixUI.Canvas, rect: PixUI.Rect, fillColor?: Nullable<PixUI.Color>): void;

    public abstract Clone(): ShapeBorder ;
}
