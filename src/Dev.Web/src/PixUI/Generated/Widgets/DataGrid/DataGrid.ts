import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class DataGrid<T> extends PixUI.Widget implements PixUI.IScrollable, PixUI.IMouseRegion {
    private static readonly $meta_PixUI_IScrollable = true;
    private static readonly $meta_PixUI_IMouseRegion = true;

    public constructor(controller: PixUI.DataGridController<T>, theme: Nullable<PixUI.DataGridTheme> = null) {
        super();
        this._controller = controller;
        this._controller.Attach(this);

        this.Theme = theme ?? PixUI.DataGridTheme.Default;

        this.MouseRegion = new PixUI.MouseRegion();
        this.MouseRegion.PointerMove.Add(this._controller.OnPointerMove, this._controller);
        this.MouseRegion.PointerDown.Add(this._controller.OnPointerDown, this._controller);
    }

    private readonly _controller: PixUI.DataGridController<T>;
    public readonly Theme: PixUI.DataGridTheme;

    public get Columns(): PixUI.DataGridColumn<T>[] {
        return this._controller.Columns;
    }

    public set Columns(value: PixUI.DataGridColumn<T>[]) {
        this._controller.Columns = value;
    }

    #MouseRegion: PixUI.MouseRegion;
    public get MouseRegion() {
        return this.#MouseRegion;
    }

    private set MouseRegion(value) {
        this.#MouseRegion = value;
    }


    public get ScrollOffsetX(): number {
        return this._controller.ScrollController.OffsetX;
    }

    public get ScrollOffsetY(): number {
        return this._controller.ScrollController.OffsetY;
    }

    public OnScroll(dx: number, dy: number): PixUI.Offset {
        if (this._controller.DataView == null || this._controller.DataView.length == 0)
            return PixUI.Offset.Empty;

        let totalRowsHeight = this._controller.TotalRowsHeight;
        let totalHeaderHeight = this._controller.TotalHeaderHeight;
        let maxOffsetX = Math.max(0, this._controller.TotalColumnsWidth - this.W);
        let maxOffsetY = Math.max(0, totalRowsHeight - (this.H - totalHeaderHeight));

        let oldVisibleRowStart = this._controller.VisibleStartRowIndex;
        let visibleRows = this._controller.VisibleRows;

        let offset = this._controller.ScrollController.OnScroll(dx, dy, maxOffsetX, maxOffsetY);
        if (!offset.IsEmpty) {
            //根据向上或向下滚动计算需要清除缓存的边界, TODO:考虑多一部分范围，现暂超出范围即清除
            if (dy > 0) {
                let newVisibleRowStart = this._controller.VisibleStartRowIndex;
                if (newVisibleRowStart != oldVisibleRowStart)
                    this._controller.ClearCacheOnScroll(true, newVisibleRowStart);
            } else {
                let oldVisibleRowEnd = oldVisibleRowStart + visibleRows;
                let newVisibleRowEnd = this._controller.VisibleStartRowIndex + visibleRows;
                if (oldVisibleRowEnd != newVisibleRowEnd)
                    this._controller.ClearCacheOnScroll(false, newVisibleRowEnd);
            }

            this.Invalidate(PixUI.InvalidAction.Repaint);
        }

        return offset;
    }


    Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        this.SetSize(width, height);
        this._controller.CalcColumnsWidth(new PixUI.Size(width, height));
    }

    Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        let size = new PixUI.Size(this.W, this.H);
        //clip first
        canvas.save();
        canvas.clipRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), CanvasKit.ClipOp.Intersect, false);

        //TODO: 暂每次计算可见列
        let visibleColumns = this._controller.LayoutVisibleColumns((size).Clone());
        let totalColumnsWidth = this._controller.TotalColumnsWidth;

        //draw header
        this.PaintHeader(canvas, (size).Clone(), totalColumnsWidth, visibleColumns);

        //draw rows
        if (this._controller.DataView == null || this._controller.DataView.length == 0) {
            //TODO: draw no data
            canvas.restore();
            return;
        }

        if (this._controller.ScrollController.OffsetY > 0) {
            let clipRect = PixUI.Rect.FromLTWH(
                0, this._controller.TotalHeaderHeight, size.Width,
                size.Height - this._controller.TotalHeaderHeight);
            canvas.clipRect(clipRect, CanvasKit.ClipOp.Intersect, false);
        }

        this.PaintRows(canvas, (size).Clone(), totalColumnsWidth, visibleColumns);

        //draw shadow for scroll vertical
        if (this._controller.ScrollController.OffsetY > 0) {
            let shadowPath = new CanvasKit.Path();
            shadowPath.addRect(PixUI.Rect.FromLTWH(0, 0, Math.min(size.Width, totalColumnsWidth),
                this._controller.TotalHeaderHeight));
            PixUI.DrawShadow(canvas, shadowPath, PixUI.Colors.Black, 5.0, false, this.Root!.Window.ScaleFactor);
            shadowPath.delete();
        }

        //draw highlights //TODO:考虑使用Overlay绘制，暂在DataGrid内直接绘制
        this.PaintHighlight(canvas);

        canvas.restore();
    }

    private PaintHeader(canvas: PixUI.Canvas, size: PixUI.Size, totalColumnsWidth: number,
                        visibleColumns: System.IList<PixUI.DataGridColumn<T>>) {
        let paintedGroupColumns = new System.List<PixUI.DataGridGroupColumn<T>>();

        if (size.Width < totalColumnsWidth && this._controller.HasFrozen) {
            //先画冻结列
            let frozenColumns = visibleColumns.Where(c => c.Frozen);
            for (const col of frozenColumns) {
                this.PaintHeaderCell(canvas, col, paintedGroupColumns);
            }

            //clip scroll region
            let clipRect = this._controller.GetScrollClipRect(0, size.Height);
            canvas.save();
            canvas.clipRect(clipRect, CanvasKit.ClipOp.Intersect, false);

            //再画其他列
            let noneFrozenColumns = visibleColumns.Where(c => !c.Frozen);
            for (const col of noneFrozenColumns) {
                this.PaintHeaderCell(canvas, col, paintedGroupColumns);
            }

            canvas.restore();
        } else {
            for (const col of visibleColumns) {
                this.PaintHeaderCell(canvas, col, paintedGroupColumns);
            }
        }
    }

    private PaintHeaderCell(canvas: PixUI.Canvas, column: PixUI.DataGridColumn<T>,
                            paintedGroupColumns: System.IList<PixUI.DataGridGroupColumn<T>>) {
        let cellRect = this.GetHeaderCellRect(column);
        column.PaintHeader(canvas, (cellRect).Clone(), this.Theme);
        this.PaintCellBorder(canvas, cellRect);

        if (column.Parent != null && !paintedGroupColumns.Contains(column.Parent)) {
            //因为布局时没有计算parent的位置
            let parent = column.Parent!;
            let index = parent.Children.indexOf(column);
            let offsetLeft = 0.0;
            for (let i = 0; i < index; i++) {
                offsetLeft += parent.Children[i].LayoutWidth;
            }

            parent.CachedLeft = column.CachedLeft - offsetLeft;

            this.PaintHeaderCell(canvas, parent, paintedGroupColumns);
            paintedGroupColumns.Add(parent);
        }
    }

    private GetHeaderCellRect(column: PixUI.DataGridColumn<T>): PixUI.Rect {
        let rowIndex = column.HeaderRowIndex;
        let cellTop = rowIndex * this._controller.HeaderRowHeight;
        let cellHeight = column instanceof PixUI.DataGridGroupColumn<T>
            ? this._controller.HeaderRowHeight
            : (this._controller.HeaderRows - rowIndex) * this._controller.HeaderRowHeight;
        return PixUI.Rect.FromLTWH(column.CachedLeft, cellTop, column.LayoutWidth, cellHeight);
    }

    private PaintRows(canvas: PixUI.Canvas, size: PixUI.Size, totalColumnsWidth: number,
                      visibleColumns: System.IList<PixUI.DataGridColumn<T>>) {
        let headerHeight = this._controller.TotalHeaderHeight;
        let deltaY = this._controller.ScrollDeltaY;
        let startRowIndex = this._controller.VisibleStartRowIndex;

        if (size.Width < totalColumnsWidth && this._controller.HasFrozen) {
            //先画冻结列
            let frozenColumns = visibleColumns.Where(c => c.Frozen == true);
            for (const col of frozenColumns) {
                this.PaintColumnCells(canvas, col, startRowIndex, headerHeight, deltaY, size.Height);
            }

            //clip scroll region
            let clipRect = this._controller.GetScrollClipRect(headerHeight, size.Height - headerHeight);
            canvas.save();
            canvas.clipRect(clipRect, CanvasKit.ClipOp.Intersect, false);

            //再画其他列
            let noneFrozenColumns = visibleColumns.Where(c => c.Frozen == false);
            for (const col of noneFrozenColumns) {
                this.PaintColumnCells(
                    canvas, col, startRowIndex, headerHeight, deltaY, size.Height);
            }

            canvas.restore();
        } else {
            for (const col of visibleColumns) {
                this.PaintColumnCells(
                    canvas, col, startRowIndex, headerHeight, deltaY, size.Height);
            }
        }
    }

    private PaintColumnCells(canvas: PixUI.Canvas, col: PixUI.DataGridColumn<T>, startRow: number,
                             offsetY: number, deltaY: number, maxHeight: number) {
        let rowHeight = this.Theme.RowHeight;
        for (let j = startRow; j < this._controller.DataView!.length; j++) {
            let cellRect = PixUI.Rect.FromLTWH(
                col.CachedLeft, offsetY - deltaY, col.LayoutWidth, rowHeight);

            //TODO:暂在这里画stripe背景
            if (this.Theme.StripeRows && j % 2 != 0) {
                let paint = PixUI.PaintUtils.Shared(this.Theme.StripeBgColor);
                canvas.drawRect(cellRect, paint);
            }

            col.PaintCell(canvas, this._controller, j, (cellRect).Clone());

            let borderRect = new PixUI.Rect(col.CachedVisibleLeft, cellRect.Top,
                col.CachedVisibleRight, cellRect.Top + rowHeight);
            this.PaintCellBorder(canvas, borderRect);

            offsetY += rowHeight;
            if (offsetY >= maxHeight) break;
        }
    }

    private PaintCellBorder(canvas: PixUI.Canvas, cellRect: PixUI.Rect) {
        let paint = PixUI.PaintUtils.Shared(this.Theme.BorderColor, CanvasKit.PaintStyle.Stroke, 1);
        canvas.drawRect(cellRect, paint);
    }

    private PaintHighlight(canvas: PixUI.Canvas) {
        if (this.Theme.HighlightingCurrentRow) {
            let rowRect = this._controller.GetCurrentRowRect();
            if (rowRect != null) {
                if (this.Theme.HighlightingCurrentCell) {
                    let paint = PixUI.PaintUtils.Shared(this.Theme.HighlightRowBgColor);
                    canvas.drawRect(rowRect, paint);
                } else {
                    let paint = PixUI.PaintUtils.Shared(PixUI.Theme.FocusedColor,
                        CanvasKit.PaintStyle.Stroke, PixUI.Theme.FocusedBorderWidth);
                    canvas.drawRect(rowRect, paint);
                }
            }
        }

        if (this.Theme.HighlightingCurrentCell) {
            let cellRect = this._controller.GetCurrentCellRect();
            if (cellRect != null) {
                let paint = PixUI.PaintUtils.Shared(PixUI.Theme.FocusedColor,
                    CanvasKit.PaintStyle.Stroke, PixUI.Theme.FocusedBorderWidth);
                canvas.drawRect(cellRect, paint);
            }
        }
    }

}
