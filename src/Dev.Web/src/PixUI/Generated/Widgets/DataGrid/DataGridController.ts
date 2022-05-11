import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class DataGridController<T> {
    public constructor(columns: System.IList<PixUI.DataGridColumn<T>>, theme: Nullable<PixUI.DataGridTheme> = null) {
        this.Columns = columns;
        this.Theme = theme ?? new PixUI.DataGridTheme();

        //展开非分组列
        this.HeaderRows = 1;
        for (const column of columns) {
            this.GetLeafColumns(column, this._cachedLeafColumns, null);
        }

        //TODO:纠正一些错误的冻结列设置,如全部冻结，中间有冻结等
        this.HasFrozen = this._cachedLeafColumns.Any(c => c.Frozen);
    }

    public readonly Columns: System.IList<PixUI.DataGridColumn<T>>;
    public readonly Theme: PixUI.DataGridTheme;

    public readonly ScrollController: PixUI.ScrollController = new PixUI.ScrollController(PixUI.ScrollDirection.Both);

    private _owner: Nullable<PixUI.DataGrid<T>>;

    public Attach(dataGrid: PixUI.DataGrid<T>) {
        this._owner = dataGrid;
    }


    #HeaderRows: number = 1;
    public get HeaderRows() {
        return this.#HeaderRows;
    }

    private set HeaderRows(value) {
        this.#HeaderRows = value;
    }

    #HeaderRowHeight: number = 35;
    public get HeaderRowHeight() {
        return this.#HeaderRowHeight;
    }

    private set HeaderRowHeight(value) {
        this.#HeaderRowHeight = value;
    }

    public get TotalHeaderHeight(): number {
        return this.HeaderRows * this.HeaderRowHeight;
    }

    public get TotalRowsHeight(): number {
        return this.DataView == null ? 0 : this.DataView.length * this.RowHeight;
    }

    public get TotalColumnsWidth(): number {
        return this._cachedLeafColumns.Sum(c => c.LayoutWidth);
    }

    #RowHeight: number = 28;
    public get RowHeight() {
        return this.#RowHeight;
    }

    private set RowHeight(value) {
        this.#RowHeight = value;
    }

    #HasFrozen: boolean = false;
    public get HasFrozen() {
        return this.#HasFrozen;
    }

    private set HasFrozen(value) {
        this.#HasFrozen = value;
    }

    public get ScrollDeltaY(): number {
        return this.ScrollController.OffsetY % this.RowHeight;
    }

    public get VisibleStartRowIndex(): number {
        return (Math.floor(Math.trunc(this.ScrollController.OffsetY / this.RowHeight)) & 0xFFFFFFFF);
    }


    private _dataSource: Nullable<System.IList<T>>;

    public set DataSource(value: System.IList<T>) {
        this._dataSource = value;
        this._owner?.Invalidate(PixUI.InvalidAction.Repaint);
    }

    public get DataView(): Nullable<System.IList<T>> {
        //TODO: sort and filter
        return this._dataSource;
    }


    // 所有非分组的列集合
    private readonly _cachedLeafColumns: System.IList<PixUI.DataGridColumn<T>>
        = new System.List<PixUI.DataGridColumn<T>>();

    private readonly _cachedVisibleColumns: System.IList<PixUI.DataGridColumn<T>> = new System.List<PixUI.DataGridColumn<T>>();

    // 缓存的组件尺寸
    private _cachedWidgetSize: PixUI.Size = new PixUI.Size(0, 0);

    private _cachedScrollLeft: number = 0.0;
    private _cachedScrollRight: number = 0.0;

    private _cachedHitInHeader: Nullable<PixUI.DataGridHitTestResult<T>>;
    private _cachedHitInRows: Nullable<PixUI.DataGridHitTestResult<T>>;


    public Invalidate() {
        this._owner?.Invalidate(PixUI.InvalidAction.Repaint);
    }

    public OnPointerMove(e: PixUI.PointerEvent) {
        if (e.Buttons == PixUI.PointerButtons.None) {
            if (e.Y <= this.TotalHeaderHeight) {
                this._cachedHitInHeader = this.HitTestInHeader(e.X, e.Y);
                if (this._cachedHitInHeader != null && this._cachedHitInHeader.IsColumnResizer)
                    PixUI.Cursor.Current = PixUI.Cursors.ResizeLR;
                else
                    PixUI.Cursor.Current = PixUI.Cursors.Arrow;
            } else if (this._cachedHitInHeader != null) {
                PixUI.Cursor.Current = PixUI.Cursors.Arrow;
                this._cachedHitInHeader = null;
            }
        } else if (e.Buttons == PixUI.PointerButtons.Left) {
            if (e.DeltaX != 0 && this._cachedHitInHeader != null) {
                //TODO:根据列宽定义改变
                let col = this._cachedHitInHeader.Column;
                if (col.Width.Type == PixUI.ColumnWidthType.Fixed) {
                    let delta = e.DeltaX;
                    let newWidth = col.Width.Value + delta;
                    col.Width.ChangeValue(newWidth);
                    col.OnResized(); //固定列暂需要
                    if (delta < 0 && this.ScrollController.OffsetX > 0) {
                        //减小需要重设滚动位置
                        this.ScrollController.OffsetX =
                            Math.max(this.ScrollController.OffsetX + delta, 0);
                    }

                    //重新计算所有列宽并重绘
                    this.CalcColumnsWidth(this._cachedWidgetSize, true);
                    this._owner?.Invalidate(PixUI.InvalidAction.Repaint);
                }
            }
        }
    }

    public OnPointerDown(e: PixUI.PointerEvent) {
        if (e.Y <= this.TotalHeaderHeight) {
            //do nothing now
            return;
        }

        this._cachedHitInRows = this.HitTestInRows(e.X, e.Y);
        //TODO: if (res == _cachedHitInRows) return;

        //检查是否需要自动滚动
        // var needScroll = false;
        if (this._cachedHitInRows != null && (this._cachedHitInRows.ScrollDeltaX != 0 ||
            this._cachedHitInRows.ScrollDeltaY != 0)) {
            // needScroll = true;
            this.ScrollController.OffsetX += this._cachedHitInRows.ScrollDeltaX;
            this.ScrollController.OffsetY += this._cachedHitInRows.ScrollDeltaY;
        }

        // if (needScroll)
        this._owner?.Invalidate(PixUI.InvalidAction.Repaint);
    }

    private HitTestInHeader(x: number, y: number): Nullable<PixUI.DataGridHitTestResult<T>> {
        for (const col of this._cachedVisibleColumns) {
            if (col.CachedVisibleLeft <= x && x <= col.CachedVisibleRight) {
                let isColumnResizer = col.CachedVisibleRight - x <= 5;
                return new PixUI.DataGridHitTestResult<T>(col, null, 0, 0, isColumnResizer);
            }
        }

        return null;
    }

    private HitTestInRows(x: number, y: number): Nullable<PixUI.DataGridHitTestResult<T>> {
        //TODO:先判断仍旧在缓存的范围内，是则直接返回

        if (this.DataView == null || this.DataView.length == 0) return null;

        let scrollX = 0;
        let scrollY = 0;

        let rowIndex = (Math.floor(Math.trunc((y - this.TotalHeaderHeight + this.ScrollController.OffsetY) / this.RowHeight)) & 0xFFFFFFFF);
        let deltaY = this.ScrollDeltaY;
        if (deltaY != 0) {
            if (rowIndex == this.VisibleStartRowIndex) {
                scrollY = -deltaY;
            } //TODO: rowIndex == visibleEndRowIndex
        }

        for (const col of this._cachedVisibleColumns) {
            if (col.CachedVisibleLeft <= x && x <= col.CachedVisibleRight) {
                if (col.CachedVisibleLeft != col.CachedLeft) {
                    scrollX = col.CachedLeft - col.CachedVisibleLeft;
                } else if (col.CachedVisibleRight != col.CachedLeft + col.LayoutWidth) {
                    scrollX = col.CachedLeft + col.LayoutWidth - col.CachedVisibleRight;
                }

                return new PixUI.DataGridHitTestResult<T>(col, rowIndex, scrollX, scrollY);
            }
        }

        return null;
    }


    public CalcColumnsWidth(widgetSize: PixUI.Size, force: boolean = false) {
        let needCalc = this._cachedWidgetSize.Width != widgetSize.Width;
        if (this.ScrollController.OffsetX > 0 && widgetSize.Width > this._cachedWidgetSize.Width) {
            //如果变宽了且有横向滚动，需要扣减
            let deltaX = widgetSize.Width - this._cachedWidgetSize.Width;
            this.ScrollController.OffsetX = Math.max(this.ScrollController.OffsetX - deltaX, 0);
        }

        this._cachedWidgetSize = (widgetSize).Clone();
        if (!needCalc && !force) return;

        //先计算固定宽度列
        let fixedColumns = this._cachedLeafColumns
            .Where(c => c.Width.Type == PixUI.ColumnWidthType.Fixed).ToArray();
        let fixedWidth = fixedColumns.Sum(c => c.Width.Value);
        let leftWidth = this._cachedWidgetSize.Width - fixedWidth;
        let leftColumns = this._cachedLeafColumns.length - fixedColumns.length;

        //再计算百分比列宽度
        let percentColumns = this._cachedLeafColumns
            .Where(c => c.Width.Type == PixUI.ColumnWidthType.Percent).ToArray();
        let percentWidth = percentColumns.Sum(c => {
            c.CalcWidth(leftWidth, leftColumns);
            return c.LayoutWidth;
        });
        leftWidth -= percentWidth;
        leftColumns -= percentColumns.length;

        //最后计算自动列宽
        let autoColumns = this._cachedLeafColumns
            .Where(c => c.Width.Type == PixUI.ColumnWidthType.Auto).ToArray();
        for (const col of autoColumns) {
            col.CalcWidth(leftWidth, leftColumns);
        }
    }

    public LayoutVisibleColumns(size: PixUI.Size): System.IList<PixUI.DataGridColumn<T>> {
        this._cachedVisibleColumns.Clear();

        let colStartIndex = 0;
        let colEndIndex = this._cachedLeafColumns.length - 1;
        let remainWidth = size.Width;
        let offsetX = 0;
        let needScroll = size.Width < this.TotalColumnsWidth;
        let insertIndex = 0;

        if (needScroll && this.HasFrozen) {
            //先计算左侧冻结列
            for (let i = 0; i < this._cachedLeafColumns.length; i++) {
                let col = this._cachedLeafColumns[i];
                if (!col.Frozen) {
                    colStartIndex = i;
                    break;
                }

                col.CachedLeft = col.CachedVisibleLeft = offsetX;
                col.CachedVisibleRight = col.CachedLeft + col.LayoutWidth;
                this._cachedVisibleColumns.Insert(insertIndex++, col);

                offsetX += col.LayoutWidth;
            }

            remainWidth -= offsetX;
            if (remainWidth <= 0) return this._cachedVisibleColumns;

            //再计算右侧冻结列
            let rightOffsetX = 0.0;
            for (let i = this._cachedLeafColumns.length - 1; i >= 0; i--) {
                let col = this._cachedLeafColumns[i];
                if (!col.Frozen) {
                    colEndIndex = i;
                    break;
                }

                col.CachedLeft = size.Width - rightOffsetX - col.LayoutWidth;
                col.CachedVisibleLeft = col.CachedLeft;
                col.CachedVisibleRight = col.CachedLeft + col.LayoutWidth;
                this._cachedVisibleColumns.Add(col);

                rightOffsetX += col.LayoutWidth;
                if (remainWidth - rightOffsetX <= 0) return this._cachedVisibleColumns;
            }

            remainWidth -= rightOffsetX;
            if (remainWidth <= 0) return this._cachedVisibleColumns;
        }

        this._cachedScrollLeft = offsetX;
        this._cachedScrollRight = offsetX + remainWidth;

        if (this.ScrollController.OffsetX > 0) {
            let skipWidth = 0.0;
            for (let i = colStartIndex; i <= colEndIndex; i++) {
                let col = this._cachedLeafColumns[i];
                skipWidth += col.LayoutWidth;
                if (skipWidth <= this.ScrollController.OffsetX) continue;

                colStartIndex = i;
                offsetX = offsetX - this.ScrollController.OffsetX + (skipWidth - col.LayoutWidth);
                break;
            }
        }

        for (let i = colStartIndex; i <= colEndIndex; i++) {
            let col = this._cachedLeafColumns[i];
            col.CachedLeft = offsetX;
            col.CachedVisibleLeft = Math.max(this._cachedScrollLeft, col.CachedLeft);
            col.CachedVisibleRight =
                Math.min(this._cachedScrollRight, col.CachedLeft + col.LayoutWidth);
            this._cachedVisibleColumns.Insert(insertIndex++, col);

            // print(
            //     "${col.label} offsetX=$offsetX VL=${col.cachedVisibleLeft} VR=${col.cachedVisibleRight}");

            offsetX += col.LayoutWidth;
            if (offsetX >= this._cachedScrollRight) break;
        }

        return this._cachedVisibleColumns;
    }

    public GetScrollClipRect(top: number, height: number): PixUI.Rect {
        return PixUI.Rect.FromLTWH(this._cachedScrollLeft, top, this._cachedScrollRight - this._cachedScrollLeft, height);
    }

    public GetCurrentCellRect(): Nullable<PixUI.Rect> {
        if (this._cachedHitInRows == null || this._cachedHitInRows.RowIndex == null)
            return null;

        let hitColumn = this._cachedHitInRows.Column;
        let top = this.TotalHeaderHeight +
            (this._cachedHitInRows.RowIndex - this.VisibleStartRowIndex) * this.RowHeight -
            this.ScrollDeltaY;
        return new PixUI.Rect(hitColumn.CachedVisibleLeft, top, hitColumn.CachedVisibleRight, top + this.RowHeight);
    }

    private GetLeafColumns(column: PixUI.DataGridColumn<T>, leafColumns: System.IList<PixUI.DataGridColumn<T>>, parentFrozen: Nullable<boolean>) {
        if (parentFrozen != null)
            column.Frozen = parentFrozen;

        if (column instanceof PixUI.DataGridGroupColumn) {
            const groupColumn = column;
            this.HeaderRows += 1;
            for (const child of groupColumn.Children) {
                child.Parent = groupColumn;
                this.GetLeafColumns(child, leafColumns, column.Frozen);
            }
        } else {
            leafColumns.Add(column);
        }
    }

    public Init(props: Partial<DataGridController<T>>): DataGridController<T> {
        Object.assign(this, props);
        return this;
    }

}
