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
}
