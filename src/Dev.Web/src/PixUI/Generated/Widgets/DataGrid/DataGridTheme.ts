import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class DataGridTheme {
    public constructor() {
        this.DefaultHeaderCellStyle = new PixUI.CellStyle().Init({
            Color: (PixUI.Colors.Black).Clone(),
            BackgroundColor: new PixUI.Color(0xFFEBEBEB),
            HorizontalAlignment: PixUI.HorizontalAlignment.Center,
            FontWeight: CanvasKit.FontWeight.Bold
        });

        this.DefaultRowCellStyle = new PixUI.CellStyle().Init({Color: (PixUI.Colors.Black).Clone()});
    }

    public readonly DefaultHeaderCellStyle: PixUI.CellStyle;
    public readonly DefaultRowCellStyle: PixUI.CellStyle;

    public CellPadding: number = 5.0;

    public StripeRows: boolean = true;
    public StripeBgColor: PixUI.Color = new PixUI.Color(0xFFEEEEEE);

    public HighlightingCurrentCell: boolean = true;
    public HighlightingCurrentRow: boolean = true;

    public HighlightRowBgColor: PixUI.Color = new PixUI.Color(0x30263238);

    public Init(props: Partial<DataGridTheme>): DataGridTheme {
        Object.assign(this, props);
        return this;
    }
}
