import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class DataGridIconColumn<T> extends PixUI.DataGridColumn<T> {
    public constructor(label: string, cellValueGetter: System.Func2<T, Nullable<PixUI.IconData>>, width: Nullable<PixUI.ColumnWidth> = null, headerCellStyle: Nullable<PixUI.CellStyle> = null, cellStyle: Nullable<PixUI.CellStyle> = null, cellStyleGetter: Nullable<System.Func3<T, number, PixUI.CellStyle>> = null, frozen: boolean = false) {
        super(label, width, headerCellStyle, cellStyle, cellStyleGetter, frozen);
        this.CellValueGetter = cellValueGetter;
    }


    public readonly CellValueGetter: System.Func2<T, Nullable<PixUI.IconData>>;


    public PaintCell(canvas: PixUI.Canvas, controller: PixUI.DataGridController<T>, rowIndex: number, cellRect: PixUI.Rect) {
        let row = controller.DataView![rowIndex];
        let icon = this.CellValueGetter(row);
        if (icon == null) return;

        let style = this.CellStyleGetter != null
            ? this.CellStyleGetter(row, rowIndex)
            : this.CellStyle ?? controller.Theme.DefaultRowCellStyle;

        //TODO: cache icon painter
        let iconPainter = new PixUI.IconPainter(controller.Invalidate.bind(controller));
        let offsetX = cellRect.Left + PixUI.CellStyle.CellPadding;
        let offsetY = cellRect.Top;
        if (style.VerticalAlignment == PixUI.VerticalAlignment.Middle) {
            offsetY += (cellRect.Height - style.FontSize) / 2;
        } else if (style.VerticalAlignment == PixUI.VerticalAlignment.Bottom) {
            offsetY = offsetY - cellRect.Bottom - style.FontSize;
        }

        iconPainter.Paint(canvas, style.FontSize, (style.Color ?? PixUI.Colors.Black).Clone(), (icon).Clone(), offsetX, offsetY);
        iconPainter.Dispose();
    }

    public Init(props: Partial<DataGridIconColumn<T>>): DataGridIconColumn<T> {
        Object.assign(this, props);
        return this;
    }
}
