import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class DataGridIconColumn<T> extends PixUI.DataGridColumn<T> {
    public constructor(label: string, cellValueGetter: System.Func2<T, Nullable<PixUI.IconData>>) {
        super(label);
        this._cellValueGetter = cellValueGetter;
    }

    private readonly _cellValueGetter: System.Func2<T, Nullable<PixUI.IconData>>;

    public PaintCell(canvas: PixUI.Canvas, controller: PixUI.DataGridController<T>, rowIndex: number, cellRect: PixUI.Rect) {
        let row = controller.DataView![rowIndex];
        let icon = this._cellValueGetter(row);
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

        iconPainter.Paint(canvas, style.FontSize, style.Color ?? PixUI.Colors.Black, icon, offsetX, offsetY);
        iconPainter.Dispose();
    }
}
