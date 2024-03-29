import * as PixUI from '@/PixUI'

export class DataGridTheme {
    private static _default: Nullable<DataGridTheme>;

    public static get Default(): DataGridTheme {
        return DataGridTheme._default ??= new DataGridTheme();
    }

    public constructor() {
        this.DefaultHeaderCellStyle = new PixUI.CellStyle().Init(
            {
                Color: PixUI.Colors.Black, BackgroundColor: new PixUI.Color(0xFFF5F7FA),
                HorizontalAlignment: PixUI.HorizontalAlignment.Center, FontWeight: CanvasKit.FontWeight.Bold,
            });

        this.DefaultRowCellStyle = new PixUI.CellStyle().Init({Color: PixUI.Colors.Black});
    }

    public readonly DefaultHeaderCellStyle: PixUI.CellStyle;
    public readonly DefaultRowCellStyle: PixUI.CellStyle;

    public RowHeight: number = 28;
    public CellPadding: number = 5.0;

    public BorderColor: PixUI.Color = new PixUI.Color(0xFFEBEEF5);

    public StripeRows: boolean = true;
    public StripeBgColor: PixUI.Color = new PixUI.Color(0xFFFAFAFA);

    public HighlightingCurrentCell: boolean = false;
    public HighlightingCurrentRow: boolean = true;

    public HighlightRowBgColor: PixUI.Color = new PixUI.Color(0x30263238);
}
