import * as PixUI from '@/PixUI'
/// <summary>
/// A ShapeBorder that draws an outline with the width and color specified by [side].
/// </summary>
export abstract class OutlinedBorder extends PixUI.ShapeBorder {
    public readonly Side: PixUI.BorderSide;

    public get Dimensions(): PixUI.EdgeInsets {
        return PixUI.EdgeInsets.All(this.Side.Width);
    }

    public constructor(side: Nullable<PixUI.BorderSide>) {
        super();
        this.Side = side ?? PixUI.BorderSide.Empty;
    }

    /// <summary>
    /// Returns a copy of this OutlinedBorder that draws its outline with the
    /// specified [side], if [side] is non-null.
    /// </summary>
    public abstract CopyWith(side: Nullable<PixUI.BorderSide>): OutlinedBorder ;
}
