import * as System from '@/System'
import * as PixUI from '@/PixUI'

export abstract class DataGridColumn<T> {
    protected constructor(label: string) {
        this.Label = label;
    }

    /// <summary>
    /// 列标题
    /// </summary>
    public readonly Label: string;

    public Width: PixUI.ColumnWidth = PixUI.ColumnWidth.Auto();
    public HeaderCellStyle: Nullable<PixUI.CellStyle>;
    public CellStyle: Nullable<PixUI.CellStyle>;
    public CellStyleGetter: Nullable<System.Func3<T, number, PixUI.CellStyle>>;

    /// <summary>
    /// 是否冻结列
    /// </summary>
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


    /// <summary>
    /// 经过布局计算后的实际像素宽度
    /// </summary>
    public get LayoutWidth(): number {
        return this.Width.Type == PixUI.ColumnWidthType.Fixed ? this.Width.Value : this._cachedWidth;
    }

    /// <summary>
    /// 非分组列计算实际像素宽度
    /// </summary>
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

        if (widthChanged) this.ClearAllCache();
    }

    /// <summary>
    /// 改变列宽或重设数据源后清除所有缓存
    /// </summary>
    public ClearAllCache() {
    }

    /// <summary>
    /// 滚动后清除相关缓存
    /// </summary>
    public ClearCacheOnScroll(isScrollDown: boolean, rowIndex: number) {
    }

    /// <summary>
    ///  画标题，允许子类特殊绘制(如CheckBoxColumn)
    /// </summary>
    public PaintHeader(canvas: PixUI.Canvas, cellRect: PixUI.Rect, theme: PixUI.DataGridTheme) {
        let cellStyle = this.HeaderCellStyle ?? theme.DefaultHeaderCellStyle;

        //画背景色
        if (cellStyle.BackgroundColor != null) {
            let paint = PixUI.PaintUtils.Shared(cellStyle.BackgroundColor);
            canvas.drawRect(cellRect, paint);
        }

        //画文本
        let ph = DataGridColumn.BuildCellParagraph((cellRect).Clone(), cellStyle, this.Label, 2);
        DataGridColumn.PaintCellParagraph(canvas, (cellRect).Clone(), cellStyle, ph);
        ph.delete();
    }

    public PaintCell(canvas: PixUI.Canvas, controller: PixUI.DataGridController<T>,
                     rowIndex: number, cellRect: PixUI.Rect) {
    }

    public static BuildCellParagraph(rect: PixUI.Rect, style: PixUI.CellStyle,
                                     text: string, maxLines: number): PixUI.Paragraph {
        let ts = PixUI.MakeTextStyle({
            color: style.Color ?? PixUI.Colors.Black,
            fontSize: style.FontSize,
            fontStyle: new PixUI.FontStyle(style.FontWeight, CanvasKit.FontSlant.Upright),
            heightMultiplier: 1
        });

        let textAlign = CanvasKit.TextAlign.Left; //default value for web
        switch (style.HorizontalAlignment) {
            case PixUI.HorizontalAlignment.Right:
                textAlign = CanvasKit.TextAlign.Right;
                break;
            case PixUI.HorizontalAlignment.Center:
                textAlign = CanvasKit.TextAlign.Center;
                break;
        }

        let ps = PixUI.MakeParagraphStyle({
            maxLines: (Math.floor(maxLines) & 0xFFFFFFFF),
            textStyle: ts,
            heightMultiplier: 1,
            textAlign: textAlign
        });
        let pb = PixUI.MakeParagraphBuilder(ps);

        pb.pushStyle(ts);
        pb.addText(text);
        pb.pop();
        let ph = pb.build();
        ph.layout(rect.Width - PixUI.CellStyle.CellPadding * 2);
        pb.delete();
        return ph;
    }

    /// <summary>
    /// 根据上下对齐方式画文本
    /// </summary>
    public static PaintCellParagraph(canvas: PixUI.Canvas, rect: PixUI.Rect, style: PixUI.CellStyle,
                                     paragraph: PixUI.Paragraph) {
        if (style.VerticalAlignment == PixUI.VerticalAlignment.Middle) {
            let x = rect.Left;
            let y = rect.Top + (rect.Height - paragraph.getHeight()) / 2;
            canvas.drawParagraph(paragraph, x + PixUI.CellStyle.CellPadding, y);
        } else if (style.VerticalAlignment == PixUI.VerticalAlignment.Bottom) {
            let x = rect.Left;
            let y = rect.Bottom;
            canvas.drawParagraph(paragraph, x + PixUI.CellStyle.CellPadding,
                y - PixUI.CellStyle.CellPadding - paragraph.getHeight());
        } else {
            canvas.drawParagraph(paragraph, rect.Left + PixUI.CellStyle.CellPadding,
                rect.Top + PixUI.CellStyle.CellPadding);
        }
    }
}
