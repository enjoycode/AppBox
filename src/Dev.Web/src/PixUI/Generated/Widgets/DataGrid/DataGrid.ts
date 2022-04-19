import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class DataGrid<T> extends PixUI.Widget implements PixUI.IScrollable, PixUI.IMouseRegion {
    private static readonly $meta_PixUI_IScrollable = true;
    private static readonly $meta_PixUI_IMouseRegion = true;

    public constructor(controller: PixUI.DataGridController<T>) {
        super();
        this._controller = controller;
        this._controller.Attach(this);

        this.MouseRegion = new PixUI.MouseRegion();
        this.MouseRegion.PointerMove.Add(this._controller.OnPointerMove, this._controller);
        this.MouseRegion.PointerDown.Add(this._controller.OnPointerDown, this._controller);
    }

    private readonly _controller: PixUI.DataGridController<T>;

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

    public OnScroll(dx: number, dy: number) {
        if (this._controller.DataView == null || this._controller.DataView.length == 0)
            return;

        let oldX = this._controller.ScrollController.OffsetX;
        let oldY = this._controller.ScrollController.OffsetY;

        let totalRowsHeight = this._controller.TotalRowsHeight;
        let totalHeaderHeight = this._controller.TotalHeaderHeight;
        let maxX = this._controller.TotalColumnsWidth - this.W;
        let maxY = totalRowsHeight - (this.H - totalHeaderHeight);
        let newX = Math.max(Math.min(oldX + dx, maxX), 0);
        let newY = Math.max(Math.min(oldY + dy, maxY), 0);

        if (oldX == newX && oldY == newY) return;

        this._controller.ScrollController.OffsetX = newX;
        this._controller.ScrollController.OffsetY = newY;
        this.Invalidate(PixUI.InvalidAction.Repaint);
    }


    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        this.SetSize(width, height);
        this._controller.CalcColumnsWidth(new PixUI.Size(width, height));
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
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
            return;
        }


        if (this._controller.ScrollController.OffsetY > 0) {
            let clipRect = PixUI.Rect.FromLTWH(
                0, this._controller.TotalHeaderHeight, size.Width, size.Height - this._controller.TotalHeaderHeight);
            canvas.clipRect(clipRect, CanvasKit.ClipOp.Intersect, false);
        }

        this.PaintRows(canvas, (size).Clone(), totalColumnsWidth, visibleColumns);

        //draw shadow for scroll vertical
        if (this._controller.ScrollController.OffsetY > 0) {
            let shadowPath = new CanvasKit.Path();
            shadowPath.addRect(PixUI.Rect.FromLTWH(0, 0, Math.min(size.Width, totalColumnsWidth), this._controller.TotalHeaderHeight));
            PixUI.DrawShadow(canvas, shadowPath, PixUI.Colors.Black, 5.0, false, this.Root!.Window.ScaleFactor);
            shadowPath.delete();
        }

        //draw highlights //TODO:考虑使用Overlay绘制，暂在DataGrid内直接绘制
        this.PaintHighlight(canvas);

        canvas.restore();
    }

    private PaintHeader(canvas: PixUI.Canvas, size: PixUI.Size, totalColumnsWidth: number, visibleColumns: System.IList<PixUI.DataGridColumn<T>>) {
        let paintedGroupColumns = new System.List<PixUI.DataGridGroupColumn<T>>();

        if (size.Width < totalColumnsWidth && this._controller.HasFrozen) {
            //先画冻结列
            let frozenColumns = visibleColumns.Where(c => c.Frozen == true);
            for (const col of frozenColumns) {
                this.PaintHeaderCell(canvas, col, paintedGroupColumns);
            }

            //clip scroll region
            let clipRect = this._controller.GetScrollClipRect(0, size.Height);
            canvas.save();
            canvas.clipRect(clipRect, CanvasKit.ClipOp.Intersect, false);

            //再画其他列
            let noneFrozenColumns = visibleColumns.Where(c => c.Frozen == false);
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

    private PaintHeaderCell(canvas: PixUI.Canvas, column: PixUI.DataGridColumn<T>, paintedGroupColumns: System.IList<PixUI.DataGridGroupColumn<T>>) {
        let cellRect = this.GetHeaderCellRect(column);
        column.PaintHeader(canvas, (cellRect).Clone(), this._controller.Theme);
        this.PaintCellBorder(canvas, cellRect);

        if (column.Parent != null && !paintedGroupColumns.Contains(column.Parent)) {
            //因为布局时没有计算parent的位置
            let parent = column.Parent!;
            let index = parent.Children.IndexOf(column);
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
        let cellHeight = column instanceof PixUI.DataGridGroupColumn ? this._controller.HeaderRowHeight
            : (this._controller.HeaderRows - rowIndex) * this._controller.HeaderRowHeight;
        return PixUI.Rect.FromLTWH(column.CachedLeft, cellTop, column.LayoutWidth, cellHeight);
    }

    private PaintRows(canvas: PixUI.Canvas, size: PixUI.Size, totalColumnsWidth: number, visibleColumns: System.IList<PixUI.DataGridColumn<T>>) {
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

    private PaintColumnCells(canvas: PixUI.Canvas, col: PixUI.DataGridColumn<T>, startRow: number, offsetY: number, deltaY: number, maxHeight: number) {
        let rowHeight = this._controller.RowHeight;
        for (let j = startRow; j < this._controller.DataView!.length; j++) {
            let cellRect = PixUI.Rect.FromLTWH(
                col.CachedLeft, offsetY - deltaY, col.LayoutWidth, rowHeight);

            //TODO:暂在这里画stripe背景
            if (this._controller.Theme.StripeRows && j % 2 != 0) {
                let paint = PixUI.PaintUtils.Shared(this._controller.Theme.StripeBgColor);
                canvas.drawRect(cellRect, paint);
            }

            col.PaintCell(canvas, this._controller, j, (cellRect).Clone());

            let borderRect = new PixUI.Rect(col.CachedVisibleLeft, cellRect.Top, col.CachedVisibleRight, cellRect.Top + rowHeight);
            this.PaintCellBorder(canvas, borderRect);

            offsetY += rowHeight;
            if (offsetY >= maxHeight) break;
        }
    }

    private PaintCellBorder(canvas: PixUI.Canvas, cellRect: PixUI.Rect) {
        let paint = PixUI.PaintUtils.Shared(PixUI.Colors.Black, CanvasKit.PaintStyle.Stroke, 1);
        canvas.drawRect(cellRect, paint);
    }

    private PaintHighlight(canvas: PixUI.Canvas) {
        let theme = this._controller.Theme;
        if (!theme.HighlightingCurrentCell && !theme.HighlightingCurrentRow)
            return;

        let cellRect = this._controller.GetCurrentCellRect();
        if (cellRect == null) return;

        if (theme.HighlightingCurrentRow) {
            let rowRect = PixUI.Rect.FromLTWH(0, cellRect.Top, Math.min(this.W, this._controller.TotalColumnsWidth), cellRect.Height);
            let paint = PixUI.PaintUtils.Shared(theme.HighlightRowBgColor);
            canvas.drawRect(rowRect, paint);
        }

        if (theme.HighlightingCurrentCell) {
            let paint = PixUI.PaintUtils.Shared(PixUI.Theme.FocusedBorderColor, CanvasKit.PaintStyle.Stroke, PixUI.Theme.FocusedBorderWidth);
            canvas.drawRect(cellRect, paint);
        }
    }

    public Init(props: Partial<DataGrid<T>>): DataGrid<T> {
        Object.assign(this, props);
        return this;
    }

}
