import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class CellStyle {
    public static readonly CellPadding: number = 5.0;

    public constructor() {
    }

    public Color: Nullable<PixUI.Color>;
    public BackgroundColor: Nullable<PixUI.Color>;
    public FontSize: number = 15;
    public FontWeight: PixUI.FontWeight = CanvasKit.FontWeight.Normal;
    public HorizontalAlignment: PixUI.HorizontalAlignment = PixUI.HorizontalAlignment.Left;
    public VerticalAlignment: PixUI.VerticalAlignment = PixUI.VerticalAlignment.Middle;

    public Init(props: Partial<CellStyle>): CellStyle {
        Object.assign(this, props);
        return this;
    }
}
