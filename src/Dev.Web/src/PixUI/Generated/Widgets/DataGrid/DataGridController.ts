import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class DataGridController<T> {
    public readonly ScrollController: PixUI.ScrollController = new PixUI.ScrollController(PixUI.ScrollDirection.Both);

    private _columns: PixUI.DataGridColumn<T>[];
    private _owner: Nullable<PixUI.DataGrid<T>>;

    public Attach(dataGrid: PixUI.DataGrid<T>) {
        this._owner = dataGrid;
    }

    public get Theme(): PixUI.DataGridTheme {
        return this._owner!.Theme;
    }

    public get DataGrid(): PixUI.DataGrid<T> {
        return this._owner!;
    }

    public get Columns(): PixUI.DataGridColumn<T>[] {
        return this._columns;
    }

    public set Columns(value: PixUI.DataGridColumn<T>[]) {
        this._columns = value;

        //展开非分组列
        this.HeaderRows = 1;
        this._cachedLeafColumns.Clear();
        for (const column of this._columns) {
            this.GetLeafColumns(column, this._cachedLeafColumns, null);
        }

        //TODO:纠正一些错误的冻结列设置,如全部冻结，中间有冻结等
        this.HasFrozen = this._cachedLeafColumns.Any(c => c.Frozen);

        if (this._owner != null && this._owner.IsMounted)
            this._owner.Invalidate(PixUI.InvalidAction.Relayout);
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
        return this.DataView == null ? 0 : this.DataView.length * this.Theme.RowHeight;
    }

    public get TotalColumnsWidth(): number {
        return this._cachedLeafColumns.Sum(c => c.LayoutWidth);
    }

    #HasFrozen: boolean = false;
    public get HasFrozen() {
        return this.#HasFrozen;
    }

    private set HasFrozen(value) {
        this.#HasFrozen = value;
    }

    public get ScrollDeltaY(): number {
        return this.ScrollController.OffsetY % this.Theme.RowHeight;
    }

    public get VisibleStartRowIndex(): number {
        return (Math.floor(Math.trunc(this.ScrollController.OffsetY / this.Theme.RowHeight)) & 0xFFFFFFFF);
    }

    public get VisibleRows(): number {
        return (Math.floor(Math.ceil(Math.max(0, this.DataGrid.H - this.TotalHeaderHeight) / this.Theme.RowHeight)) & 0xFFFFFFFF);
    }


    private _dataSource: Nullable<System.IList<T>>;

    public set DataSource(value: System.IList<T>) {
        let oldEmpty = this._dataSource == null ? true : this._dataSource.length == 0;
        let newEmpty = value == null ? true : value.length == 0;

        this._dataSource = value;
        this.ClearAllCache();

        if (oldEmpty && newEmpty) return;
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


    private readonly _selectedRows: System.List<number> = new System.List();

    public readonly SelectionChanged = new System.Event();

    public get CurrentRowIndex(): number {
        return this._selectedRows.length > 0 ? this._selectedRows[0] : -1;
    }

    public ObserveCurrentRow(): PixUI.State<Nullable<T>> {
        let state = new PixUI.RxProperty<Nullable<T>>(() => {
                if (this.DataView == null || this._selectedRows.length == 0) {
                    let nullValue: Nullable<any> = null;
                    return <Nullable<T>><unknown>nullValue; //Don't use default(T) for Web
                }

                return this.DataView[this._selectedRows[0]];
            },
            newRow => {
                if (newRow == null) {
                    this.ClearSelection();
                    return;
                }

                let index = this.DataView!.IndexOf(newRow);
                this.SelectAt(index);
            },
            false
        );
        this.SelectionChanged.Add(() => state.NotifyValueChanged());

        return state;
    }

    public SelectAt(index: number) {
        let oldRowIndex = this.CurrentRowIndex;
        //_cachedHitInRows = new DataGridHitTestResult<T>(Columns[0], index);
        let newRowIndex = index; //_cachedHitInRows != null ? _cachedHitInRows.Value.RowIndex : -1;
        this.TrySelectRow(oldRowIndex, newRowIndex);
    }

    public ClearSelection() {
        this._selectedRows.Clear();
        this._cachedHitInRows = null;
        this.SelectionChanged.Invoke();
    }

    private TrySelectRow(oldRowIndex: number, newRowIndex: number) {
        if (oldRowIndex == newRowIndex) return;

        this._selectedRows.Clear();
        if (newRowIndex != -1)
            this._selectedRows.Add(newRowIndex);
        this.SelectionChanged.Invoke();
    }


    public Invalidate() {
        this._owner?.Invalidate(PixUI.InvalidAction.Repaint);
    }

    private ClearAllCache() {
        //TODO:暂所有列，考虑仅可见列
        for (const column of this._cachedLeafColumns) {
            column.ClearAllCache();
        }
    }

    public ClearCacheOnScroll(isScrollDown: boolean, rowIndex: number) {
        //Console.WriteLine($"---------->ClearCache: down={isScrollDown} row={rowIndex}");
        //TODO:暂所有列，考虑仅可见列
        for (const column of this._cachedLeafColumns) {
            column.ClearCacheOnScroll(isScrollDown, rowIndex);
        }
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
                    col.ClearAllCache(); //固定列暂需要
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

        //TODO:暂仅支持单选
        let oldRowIndex = this.CurrentRowIndex;
        this._cachedHitInRows = this.HitTestInRows(e.X, e.Y);
        let newRowIndex = this._cachedHitInRows != null ? this._cachedHitInRows.RowIndex : -1;
        this.TrySelectRow(oldRowIndex, newRowIndex);
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
                return new PixUI.DataGridHitTestResult<T>(col, -1, 0, 0, isColumnResizer);
            }
        }

        return null;
    }

    private HitTestInRows(x: number, y: number): Nullable<PixUI.DataGridHitTestResult<T>> {
        //TODO:先判断仍旧在缓存的范围内，是则直接返回

        if (this.DataView == null || this.DataView.length == 0) return null;

        let scrollX = 0;
        let scrollY = 0;

        let rowIndex = (Math.floor(Math.trunc((y - this.TotalHeaderHeight + this.ScrollController.OffsetY) /
            this.Theme.RowHeight)) & 0xFFFFFFFF);
        //判断是否超出范围
        if (rowIndex >= this.DataView.length)
            return this._cachedHitInRows;

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
        return PixUI.Rect.FromLTWH(this._cachedScrollLeft, top, this._cachedScrollRight - this._cachedScrollLeft,
            height);
    }

    public GetCurrentRowRect(): Nullable<PixUI.Rect> {
        if (this._selectedRows.length == 0) return null;

        let top = this.TotalHeaderHeight + (this._selectedRows[0] - this.VisibleStartRowIndex) * this.Theme.RowHeight - this.ScrollDeltaY;
        return new PixUI.Rect(1, top + 1, this._owner!.W - 2, top + this.Theme.RowHeight - 1);
    }

    public GetCurrentCellRect(): Nullable<PixUI.Rect> {
        if (this._cachedHitInRows == null || this._cachedHitInRows.RowIndex == -1)
            return null;

        let hitColumn = this._cachedHitInRows.Column;
        let top = this.TotalHeaderHeight +
            (this._cachedHitInRows.RowIndex - this.VisibleStartRowIndex) *
            this.Theme.RowHeight - this.ScrollDeltaY;
        return new PixUI.Rect(hitColumn.CachedVisibleLeft + 1, top + 1,
            hitColumn.CachedVisibleRight - 2, top + this.Theme.RowHeight - 1);
    }

    private GetLeafColumns(column: PixUI.DataGridColumn<T>, leafColumns: System.IList<PixUI.DataGridColumn<T>>,
                           parentFrozen: Nullable<boolean>) {
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


    public Add(item: T) {
        this._dataSource!.Add(item);
        //TODO: refresh DataView
        this._owner?.Invalidate(PixUI.InvalidAction.Repaint);
    }

    public Remove(item: T) {
        let indexInDataView = this.DataView!.IndexOf(item);
        this.RemoveAt(indexInDataView);
    }

    public RemoveAt(index: number) {
        let rowIndex = index;
        if (!(this.DataView === this._dataSource)) {
            let rowInView = this.DataView![index];
            this.DataView.RemoveAt(index);
            rowIndex = this._dataSource!.IndexOf(rowInView);
        }

        this._dataSource!.RemoveAt(rowIndex);
        this.ClearSelection(); //TODO: rowIndex when in selection
        this.ClearAllCache(); //TODO:仅移除并重设缓存
        this._owner?.Invalidate(PixUI.InvalidAction.Repaint);
    }

    public Refresh() {
        this.ClearAllCache();
        this._owner?.Invalidate(PixUI.InvalidAction.Repaint);
    }

}
