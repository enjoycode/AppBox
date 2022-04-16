import * as System from '@/System'
import * as PixUI from '@/PixUI'

export abstract class DataGridColumn<T> {
    protected constructor(label: string, width: Nullable<PixUI.ColumnWidth> = null, headerCellStyle: Nullable<PixUI.CellStyle> = null, cellStyle: Nullable<PixUI.CellStyle> = null, cellStyleGetter: Nullable<System.Func3<T, number, PixUI.CellStyle>> = null, frozen: boolean = false) {
        this.Label = label;
        this.Width = width ?? PixUI.ColumnWidth.Auto();
        this.HeaderCellStyle = headerCellStyle;
        this.CellStyle = cellStyle;
        this.CellStyleGetter = cellStyleGetter;
        this.Frozen = frozen;
    }

    public readonly Label: string;

    public readonly Width: PixUI.ColumnWidth;
    public readonly HeaderCellStyle: Nullable<PixUI.CellStyle>;
    public readonly CellStyle: Nullable<PixUI.CellStyle>;
    public readonly CellStyleGetter: Nullable<System.Func3<T, number, PixUI.CellStyle>>;

    public Frozen: boolean = false;

    public Parent: Nullable<PixUI.DataGridGroupColumn<T>>;

    public get HeaderRowIndex(): number {
        return this.Parent == null ? 0 : this.Parent.HeaderRowIndex + 1;
    }


    //缓存的计算后的列宽度(像素)
    private _cachedWidth: number = 0;

    //缓存布局后的位置信息
    public CachedLeft: number = 0;
    public CachedVisibleLeft: number = 0;
    public CachedVisibleRight: number = 0;


    public get LayoutWidth(): number {
        return this.Width.Type == PixUI.ColumnWidthType.Fixed ? this.Width.Value : this._cachedWidth;
    }

    public CalcWidth(leftWidth: number, leftColumns: number) {
        let widthChanged = false;
        if (this.Width.Type == PixUI.ColumnWidthType.Percent) {
            let newWidth = Math.max(leftWidth / this.Width.Value, this.Width.MinValue);
            widthChanged = newWidth != this._cachedWidth;
            this._cachedWidth = newWidth;
        } else if (this.Width.Type == PixUI.ColumnWidthType.Auto) {
            let newWidth = Math.max(leftWidth / leftColumns, this.Width.MinValue);
            widthChanged = newWidth != this._cachedWidth;
            this._cachedWidth = newWidth;
        }

        if (widthChanged) this.OnResized();
    }

    public OnResized() {
    }

    public PaintHeader(canvas: PixUI.Canvas, cellRect: PixUI.Rect, theme: PixUI.DataGridTheme) {
        let cellStyle = this.HeaderCellStyle ?? theme.DefaultHeaderCellStyle;

        //画背景色
        if (cellStyle.BackgroundColor != null) {
            let paint = PixUI.PaintUtils.Shared(cellStyle.BackgroundColor);
            canvas.drawRect(cellRect, paint);
        }

        //画文本
        let ph = DataGridColumn.BuildCellParagraph(cellRect, cellStyle, this.Label, 2);
        DataGridColumn.PaintCellParagraph(canvas, cellRect, cellStyle, ph);
        ph.delete();
    }

    public PaintCell(canvas: PixUI.Canvas, controller: PixUI.DataGridController<T>, rowIndex: number, cellRect: PixUI.Rect) {
    }

    public static BuildCellParagraph(rect: PixUI.Rect, style: PixUI.CellStyle, text: string, maxLines: number): PixUI.Paragraph {
        let ps = PixUI.MakeParagraphStyle({maxLines: <number><any>maxLines});
        let pb = PixUI.MakeParagraphBuilder(ps);
        let ts = PixUI.MakeTextStyle({
            color: style.Color ?? PixUI.Colors.Black,
            heightMultiplier: 1,
            fontSize: style.FontSize,
            fontStyle: new PixUI.FontStyle(style.FontWeight, CanvasKit.FontSlant.Upright)
        });
        pb.pushStyle(ts);
        pb.addText(text);
        pb.pop();

        let ph = pb.build();
        ph.layout(rect.Width - PixUI.CellStyle.CellPadding * 2);
        pb.delete();
        return ph;
    }

    public static PaintCellParagraph(canvas: PixUI.Canvas, rect: PixUI.Rect, style: PixUI.CellStyle, paragraph: PixUI.Paragraph) {
        if (style.VerticalAlignment == PixUI.VerticalAlignment.Middle) {
            let x = rect.Left;
            let y = rect.Top + (rect.Height - paragraph.getHeight()) / 2;
            canvas.drawParagraph(paragraph, x + PixUI.CellStyle.CellPadding, y);
        } else if (style.VerticalAlignment == PixUI.VerticalAlignment.Bottom) {
            let x = rect.Left;
            let y = rect.Bottom;
            canvas.drawParagraph(paragraph, x + PixUI.CellStyle.CellPadding, y - PixUI.CellStyle.CellPadding - paragraph.getHeight());
        } else {
            canvas.drawParagraph(paragraph, rect.Left + PixUI.CellStyle.CellPadding, rect.Top + PixUI.CellStyle.CellPadding);
        }
    }
}
