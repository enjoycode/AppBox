import * as PixUI from '@/PixUI'

export abstract class OutlinedBorder extends PixUI.ShapeBorder {
    public readonly Side: PixUI.BorderSide;

    public get Dimensions(): PixUI.EdgeInsets {
        return PixUI.EdgeInsets.All(this.Side.Width);
    }

    public constructor(side: Nullable<PixUI.BorderSide>) {
        super();
        this.Side = side ?? PixUI.BorderSide.Empty;
    }

    public abstract CopyWith(side: Nullable<PixUI.BorderSide>): OutlinedBorder ;
}
