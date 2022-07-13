import * as System from '@/System'
import * as PixUI from '@/PixUI'
/// <summary>
/// 用于承载Widget的列
/// </summary>
export class DataGridHostColumn<T> extends PixUI.DataGridColumn<T> {
    public constructor(label: string, cellBuilder: System.Func3<T, number, PixUI.Widget>) {
        super(label);
        this._cellBuilder = cellBuilder;
    }

    private readonly _cellBuilder: System.Func3<T, number, PixUI.Widget>;
    private readonly _cellWidgets: System.List<PixUI.CellCache<PixUI.Widget>> = new System.List<PixUI.CellCache<PixUI.Widget>>();

    private static readonly _cellCacheComparer: PixUI.CellCacheComparer<PixUI.Widget> = new PixUI.CellCacheComparer<PixUI.Widget>();

    public PaintCell(canvas: PixUI.Canvas, controller: PixUI.DataGridController<T>, rowIndex: number, cellRect: PixUI.Rect) {
        let cellWidget = this.GetCellWidget(rowIndex, controller, cellRect);
        //TODO:对齐cellWidget
        canvas.translate(cellRect.Left, cellRect.Top);
        cellWidget.Paint(canvas, null);
        canvas.translate(-cellRect.Left, -cellRect.Top);
    }

    private GetCellWidget(rowIndex: number, controller: PixUI.DataGridController<T>, cellRect: PixUI.Rect): PixUI.Widget {
        let pattern = new PixUI.CellCache<PixUI.Widget>(rowIndex, null);
        let index = this._cellWidgets.BinarySearch(pattern, DataGridHostColumn._cellCacheComparer);
        if (index >= 0)
            return this._cellWidgets[index].CachedItem!;

        index = ~index;
        //没找到开始新建
        let row = controller.DataView![rowIndex];
        let cellWidget = this._cellBuilder(row, rowIndex);
        cellWidget.Parent = controller.DataGrid;
        cellWidget.Layout(cellRect.Width, cellRect.Height);
        let cellCachedWidget = new PixUI.CellCache<PixUI.Widget>(rowIndex, cellWidget);
        this._cellWidgets.Insert(index, cellCachedWidget);
        return cellWidget;
    }

    public ClearCacheOnScroll(isScrollDown: boolean, rowIndex: number) {
        if (isScrollDown)
            this._cellWidgets.RemoveAll(t => t.RowIndex < rowIndex);
        else
            this._cellWidgets.RemoveAll(t => t.RowIndex >= rowIndex);
    }

    public Init(props: Partial<DataGridHostColumn<T>>): DataGridHostColumn<T> {
        Object.assign(this, props);
        return this;
    }
}
