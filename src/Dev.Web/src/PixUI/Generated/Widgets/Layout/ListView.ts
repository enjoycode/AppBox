import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class ListViewController<T> extends PixUI.WidgetController<ListView<T>> {
    public readonly ScrollController: PixUI.ScrollController;
    private _dataSource: Nullable<System.IList<T>>;

    public constructor(axis: PixUI.Axis = PixUI.Axis.Vertical) {
        super();
        this.ScrollController = new PixUI.ScrollController(axis == PixUI.Axis.Vertical
            ? PixUI.ScrollDirection.Vertical
            : PixUI.ScrollDirection.Horizontal);
    }

    public get DataSource(): Nullable<System.IList<T>> {
        return this._dataSource;
    }

    public set DataSource(value: Nullable<System.IList<T>>) {
        this._dataSource = value;
        this.Widget.OnDataSourceChanged();
    }

    public ScrollTo(index: number) {
        let toChild = this.Widget.GetChildAt(index);

        //判断是否可见
        let offsetY = this.ScrollController.OffsetY;
        if (toChild.Y >= offsetY && toChild.Y + toChild.H <= this.Widget.H + offsetY)
            return;

        let deltaY = toChild.Y >= offsetY
            ? toChild.Y + toChild.H - this.Widget.H - offsetY
            : toChild.Y - offsetY;
        let offset = this.Widget.OnScroll(0, deltaY);
        if (!offset.IsEmpty)
            this.Widget.Root!.Window.AfterScrollDone(this.Widget, offset);
    }
}

export class ListView<T> extends PixUI.MultiChildWidget<PixUI.Widget> implements PixUI.IScrollable {
    private static readonly $meta_PixUI_IScrollable = true;

    public static From(widgets: System.IList<PixUI.Widget>,
                       controller: Nullable<ListViewController<PixUI.Widget>> = null): ListView<PixUI.Widget> {
        return new ListView<PixUI.Widget>((w, i) => w, widgets, controller);
    }

    public constructor(itemBuilder: System.Func3<T, number, PixUI.Widget>, dataSource: Nullable<System.IList<T>> = null,
                       controller: Nullable<ListViewController<T>> = null) {
        super();
        this._itemBuilder = itemBuilder;
        this._controller = controller ?? new ListViewController<T>();
        this._controller.AttachWidget(this);
        if (dataSource != null)
            this._controller.DataSource = dataSource;
    }

    private readonly _controller: ListViewController<T>;
    private readonly _itemBuilder: System.Func3<T, number, PixUI.Widget>;

    public OnDataSourceChanged() {
        this._children.Clear();
        if (this._controller.DataSource != null) {
            for (let i = 0; i < this._controller.DataSource.length; i++) {
                this._children.Add(this._itemBuilder(this._controller.DataSource[i], i));
            }
        }

        if (this.IsMounted)
            this.Invalidate(PixUI.InvalidAction.Relayout);
    }

    Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        let y: number = 0;
        for (const child of this._children) {
            child.Layout(width, Number.POSITIVE_INFINITY);
            // child.W = width;
            child.SetPosition(0, y);
            y += child.H;
        }

        this.SetSize(width, height);
    }

    Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        canvas.save();
        canvas.clipRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), CanvasKit.ClipOp.Intersect, false);

        let offset = this._controller.ScrollController.OffsetY;
        for (const child of this._children) {
            if (child.Y + child.H <= offset) continue;

            canvas.translate(0, child.Y - offset);
            child.Paint(canvas, null);
            canvas.translate(0, offset - child.Y);
        }

        canvas.restore();
    }

    public get ScrollOffsetX(): number {
        return this._controller.ScrollController.OffsetX;
    }

    public get ScrollOffsetY(): number {
        return this._controller.ScrollController.OffsetY;
    }

    public OnScroll(dx: number, dy: number): PixUI.Offset {
        if (this._children.length == 0) return PixUI.Offset.Empty;

        let lastChild = this._children[this._children.length - 1];
        if (lastChild.Y + lastChild.H <= this.H) return PixUI.Offset.Empty;

        let maxOffsetX = 0;
        let maxOffsetY = lastChild.Y + lastChild.H - this.H;

        let offset = this._controller.ScrollController.OnScroll(dx, dy, maxOffsetX, maxOffsetY);
        if (!offset.IsEmpty)
            this.Invalidate(PixUI.InvalidAction.Repaint);
        return offset;
    }
}
