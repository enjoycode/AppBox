import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class DataGridTextColumn<T> extends PixUI.DataGridColumn<T> {
    public constructor(label: string, cellValueGetter: System.Func2<T, string>) {
        super(label);
        this._cellValueGetter = cellValueGetter;
    }

    private readonly _cellValueGetter: System.Func2<T, string>;

    private readonly _cellParagraphs: System.List<PixUI.CellCache<PixUI.Paragraph>> = new System.List<PixUI.CellCache<PixUI.Paragraph>>();

    private static readonly _cellCacheComparer: PixUI.CellCacheComparer<PixUI.Paragraph> = new PixUI.CellCacheComparer<PixUI.Paragraph>();

    public PaintCell(canvas: PixUI.Canvas, controller: PixUI.DataGridController<T>, rowIndex: number, cellRect: PixUI.Rect) {
        let row = controller.DataView![rowIndex];
        let cellValue = this._cellValueGetter(row);
        if (System.IsNullOrEmpty(cellValue)) return;

        let style = this.CellStyleGetter != null
            ? this.CellStyleGetter(row, rowIndex)
            : this.CellStyle ?? controller.Theme.DefaultRowCellStyle;

        let ph = this.GetCellParagraph(rowIndex, controller, cellRect, cellValue, style);
        PixUI.DataGridColumn.PaintCellParagraph(canvas, (cellRect).Clone(), style, ph);
    }

    private GetCellParagraph(rowIndex: number, controller: PixUI.DataGridController<T>, cellRect: PixUI.Rect, cellValue: string, style: PixUI.CellStyle): PixUI.Paragraph {
        let pattern = new PixUI.CellCache<PixUI.Paragraph>(rowIndex, null);
        let index = this._cellParagraphs.BinarySearch(pattern, DataGridTextColumn._cellCacheComparer);
        if (index >= 0)
            return this._cellParagraphs[index].CachedItem!;

        index = ~index;
        //没找到开始新建
        let row = controller.DataView![rowIndex];
        let ph = PixUI.DataGridColumn.BuildCellParagraph((cellRect).Clone(), style, cellValue, 1);
        let cellCachedWidget = new PixUI.CellCache<PixUI.Paragraph>(rowIndex, ph);
        this._cellParagraphs.Insert(index, cellCachedWidget);
        return ph;
    }

    public ClearAllCache() {
        this._cellParagraphs.Clear();
    }

    public ClearCacheOnScroll(isScrollDown: boolean, rowIndex: number) {
        if (isScrollDown)
            this._cellParagraphs.RemoveAll(t => t.RowIndex < rowIndex);
        else
            this._cellParagraphs.RemoveAll(t => t.RowIndex >= rowIndex);
    }
}
