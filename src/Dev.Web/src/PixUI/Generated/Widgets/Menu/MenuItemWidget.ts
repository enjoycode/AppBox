import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class MenuItemWidget extends PixUI.Widget implements PixUI.IMouseRegion {
    private static readonly $meta_PixUI_IMouseRegion = true;

    public constructor(menuItem: PixUI.MenuItem, depth: number, inPopup: boolean, controller: PixUI.MenuController) {
        super();
        this.Depth = depth;
        this.MenuItem = menuItem;
        this._controller = controller;

        this.BuildChildren(inPopup);

        this.MouseRegion = new PixUI.MouseRegion(() => PixUI.Cursors.Hand);
        this.MouseRegion.HoverChanged.Add(this._OnHoverChanged, this);
        this.MouseRegion.PointerUp.Add(this._OnPointerUp, this);
    }

    public readonly MenuItem: PixUI.MenuItem;
    public readonly Depth: number;
    private readonly _controller: PixUI.MenuController;

    private _icon: Nullable<PixUI.Icon>;
    private _label: Nullable<PixUI.Text>; //TODO:考虑实现并使用SimpleText
    private _expander: Nullable<PixUI.Icon>;

    private _isHover: boolean = false;

    #MouseRegion: PixUI.MouseRegion;
    public get MouseRegion() {
        return this.#MouseRegion;
    }

    private set MouseRegion(value) {
        this.#MouseRegion = value;
    }

    private BuildChildren(inPopup: boolean) {
        if (this.MenuItem.Type == PixUI.MenuItemType.Divider)
            return;

        if (this.MenuItem.Icon != null) {
            this._icon = new PixUI.Icon(PixUI.State.op_Implicit_From(this.MenuItem.Icon)).Init({Color: this._controller.TextColor});
            this._icon.Parent = this;
        }

        this._label = new PixUI.Text(PixUI.State.op_Implicit_From(this.MenuItem.Label!)).Init({TextColor: this._controller.TextColor});
        this._label.Parent = this;

        if (this.MenuItem.Type == PixUI.MenuItemType.SubMenu) {
            this._expander = new PixUI.Icon(PixUI.State.op_Implicit_From(inPopup ? PixUI.Icons.Filled.ChevronRight : PixUI.Icons.Filled.ExpandMore)).Init(
                {Color: this._controller.TextColor});
            this._expander.Parent = this;
        }
    }

    private _OnPointerUp(e: PixUI.PointerEvent) {
        if (this.MenuItem.Type == PixUI.MenuItemType.MenuItem && this.MenuItem.Action != null) {
            this.MenuItem.Action();
        }

        this._controller.CloseAll();
    }

    private _OnHoverChanged(hover: boolean) {
        if (this.MenuItem.Type == PixUI.MenuItemType.Divider) return;

        this._isHover = hover;
        this.Invalidate(PixUI.InvalidAction.Repaint);

        this._controller.OnMenuItemHoverChanged(this, hover);
    }

    public ResetWidth(newWidth: number) {
        this.SetSize(newWidth, this.H);
        //右对齐快键指示orExpandIcon
        if (this._expander != null) {
            let newX = this.W - this._controller.ItemPadding.Right - this._expander.W;
            this._expander.SetPosition(newX, this._expander.Y);
        }
    }

    public VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        //need for lazy load icon font
        if (this._icon != null)
            action(this._icon);
        if (this._expander != null)
            action(this._expander);
    }

    public HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        if (!this.ContainsPoint(x, y)) return false;
        result.Add(this);
        return true;
    }

    public Layout(availableWidth: number, availableHeight: number) {
        let offsetX = this._controller.ItemPadding.Left;

        if (this.MenuItem.Type == PixUI.MenuItemType.Divider) {
            this.SetSize(offsetX + 2, 6);
            return;
        }

        if (this._icon != null) {
            this._icon.Layout(availableWidth, availableHeight);
            this._icon.SetPosition(offsetX, (availableHeight - this._icon.H) / 2);
            offsetX += this._icon.W + 5;
        }

        if (this._label != null) {
            this._label.Layout(availableWidth, availableHeight);
            this._label.SetPosition(offsetX, (availableHeight - this._label.H) / 2);
            offsetX += this._label.W + 5;
        }

        if (this._expander != null) {
            this._expander.Layout(availableWidth, availableHeight);
            this._expander.SetPosition(offsetX, (availableHeight - this._expander.H) / 2);
            offsetX += this._expander.W;
        }

        this.SetSize(offsetX + this._controller.ItemPadding.Right, availableHeight);
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        if (this.MenuItem.Type == PixUI.MenuItemType.Divider) {
            let paint = PixUI.PaintUtils.Shared(PixUI.Colors.Gray, CanvasKit.PaintStyle.Stroke, 2);
            let midY = this.H / 2;
            canvas.drawLine(this._controller.ItemPadding.Left, midY, this.W - this._controller.ItemPadding.Horizontal, midY, paint);
            return;
        }

        if (this._isHover) {
            let paint = PixUI.PaintUtils.Shared(this._controller.HoverColor, CanvasKit.PaintStyle.Fill);
            canvas.drawRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), paint);
        }

        MenuItemWidget.PaintChild(this._icon, canvas, area);
        MenuItemWidget.PaintChild(this._label, canvas, area);
        MenuItemWidget.PaintChild(this._expander, canvas, area);
    }

    private static PaintChild(child: Nullable<PixUI.Widget>, canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea>) {
        if (child == null) return;

        canvas.translate(child.X, child.Y);
        child.Paint(canvas, area);
        canvas.translate(-child.X, -child.Y);
    }

    public toString(): string {
        let labelText = this._label == null ? "" : this._label.Text.Value;
        return `MenuItemWidget[\"${labelText}\"]`;
    }
}
