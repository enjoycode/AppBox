import * as PixUI from '@/PixUI'

export class DataGridHitTestResult<T> {
    public constructor(column: PixUI.DataGridColumn<T>, rowIndex: number,
                       scrollDeltaX: number = 0, scrollDeltaY: number = 0, isColumnResizer: boolean = false) {
        this.Column = column;
        this.RowIndex = rowIndex;
        this.ScrollDeltaX = scrollDeltaX;
        this.ScrollDeltaY = scrollDeltaY;
        this.IsColumnResizer = isColumnResizer;
    }

    public readonly Column: PixUI.DataGridColumn<T>;
    public readonly RowIndex: number; //-1 == hit in header
    public readonly ScrollDeltaX: number;
    public readonly ScrollDeltaY: number;
    public readonly IsColumnResizer: boolean;
}
