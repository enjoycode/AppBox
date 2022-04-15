import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class DataGridTextColumn<T> extends PixUI.DataGridColumn<T> {
    public constructor(label: string, cellValueGetter: System.Func2<T, string>, width: Nullable<PixUI.ColumnWidth> = null, headerCellStyle: Nullable<PixUI.CellStyle> = null, cellStyle: Nullable<PixUI.CellStyle> = null, cellStyleGetter: Nullable<System.Func3<T, number, PixUI.CellStyle>> = null, frozen: boolean = false) {
        super(label, width, headerCellStyle, cellStyle, cellStyleGetter, frozen);
        this._cellValueGetter = cellValueGetter;
    }

    private readonly _cellValueGetter: System.Func2<T, string>;

    public PaintCell(canvas: PixUI.Canvas, controller: PixUI.DataGridController<T>, rowIndex: number, cellRect: PixUI.Rect) {
        let row = controller.DataView![rowIndex];
        let cellValue = this._cellValueGetter(row);
        if (System.IsNullOrEmpty(cellValue)) return;

        let style = this.CellStyleGetter != null
            ? this.CellStyleGetter(row, rowIndex)
            : this.CellStyle ?? controller.Theme.DefaultRowCellStyle;

        //TODO: cache cell paragraph
        let ph = PixUI.DataGridColumn.BuildCellParagraph(cellRect, style, cellValue, 1);
        PixUI.DataGridColumn.PaintCellParagraph(canvas, cellRect, style, ph);
        ph.delete();
    }

    public Init(props: Partial<DataGridTextColumn<T>>): DataGridTextColumn<T> {
        Object.assign(this, props);
        return this;
    }
}
