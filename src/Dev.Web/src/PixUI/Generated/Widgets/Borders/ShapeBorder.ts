import * as PixUI from '@/PixUI'
/// <summary>
/// Base class for shape outlines.
/// </summary>
export abstract class ShapeBorder {
    public abstract get Dimensions(): PixUI.EdgeInsets ;


    public abstract GetOuterPath(rect: PixUI.Rect): PixUI.Path ;

    public abstract GetInnerPath(rect: PixUI.Rect): PixUI.Path ;

    public LerpTo(to: Nullable<ShapeBorder>, tween: ShapeBorder, t: number) {
        //TODO: if (b == null) ScaleTo(1.0 - t)
    }

    public abstract Paint(canvas: PixUI.Canvas, rect: PixUI.Rect): void;

    public abstract Clone(): ShapeBorder ;
}
