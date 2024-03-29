import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class TreeNodeRow<T> extends PixUI.Widget implements PixUI.IMouseRegion {
    private static readonly $meta_PixUI_IMouseRegion = true;

    public constructor() {
        super();
        this.MouseRegion = new PixUI.MouseRegion(null, false);
        this.MouseRegion.HoverChanged.Add(this._OnHoverChanged, this);
        this.MouseRegion.PointerTap.Add(this._OnTap, this);
    }

    private _expander: Nullable<PixUI.ExpandIcon>;
    private _checkbox: Nullable<PixUI.Checkbox>;
    private _icon: Nullable<PixUI.Icon>;
    private _label: Nullable<PixUI.Text>;
    private _isHover: boolean = false;

    #MouseRegion: PixUI.MouseRegion;
    public get MouseRegion() {
        return this.#MouseRegion;
    }

    private set MouseRegion(value) {
        this.#MouseRegion = value;
    }

    public set ExpandIcon(value: PixUI.ExpandIcon) {
        this._expander = value;
        this._expander.Parent = this;
    }

    public set Checkbox(value: PixUI.Checkbox) {
        this._checkbox = value;
        this._checkbox.Parent = this;
    }

    public get Icon(): PixUI.Icon {
        return this._icon!;
    }

    public set Icon(value: PixUI.Icon) {
        this._icon = value;
        this._icon.Parent = this;
    }

    public get Label(): Nullable<PixUI.Text> {
        return this._label;
    }

    public set Label(value: Nullable<PixUI.Text>) {
        this._label = value;
        if (this._label != null) this._label.Parent = this;
    }

    private get TreeNode(): PixUI.TreeNode<T> {
        return <PixUI.TreeNode<T>><unknown>this.Parent!;
    }

    private get Controller(): PixUI.TreeController<T> {
        return this.TreeNode.Controller;
    }


    private _OnHoverChanged(hover: boolean) {
        this._isHover = hover;
        this.Invalidate(PixUI.InvalidAction.Repaint,
            new PixUI.RepaintArea(PixUI.Rect.FromLTWH(0, 0, this.Controller.TreeView!.W,
                this.Controller.NodeHeight)));
    }

    private _OnTap(e: PixUI.PointerEvent) {
        this.Controller.SelectNode(this.TreeNode);
    }


    get IsOpaque(): boolean {
        return this._isHover && this.Controller.HoverColor.IsOpaque;
    }

    ContainsPoint(x: number, y: number): boolean {
        return y >= 0 && y < this.H && x >= 0 && x < this.Controller.TreeView!.W;
    }

    VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        if (this._checkbox != null) action(this._checkbox);
        if (this._icon != null) action(this._icon);
        if (this._label != null) action(this._label);
    }

    HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        if (y < 0 || y > this.H) return false;

        result.Add(this);

        //子级判断是否命中ExpandIcon
        if (this._expander != null)
            this.HitTestChild(this._expander, x, y, result);
        if (this._checkbox != null)
            this.HitTestChild(this._checkbox, x, y, result);

        return true;
    }

    Layout(availableWidth: number, availableHeight: number) {
        let indentation = this.TreeNode.Depth * this.Controller.NodeIndent;

        // ExpandIcon
        if (this._expander != null) {
            this._expander?.Layout(this.Controller.NodeHeight, this.Controller.NodeHeight);
            this._expander?.SetPosition(indentation, (this.Controller.NodeHeight - this._expander.H) / 2);
        }
        indentation += this.Controller.NodeIndent; //always keep expand icon size

        // Icon or Checkbox
        if (this.Controller.ShowCheckbox) {
            this._checkbox!.Layout(this.Controller.NodeHeight, this.Controller.NodeHeight);
            this._checkbox.SetPosition(indentation, (this.Controller.NodeHeight - this._checkbox.H) / 2);
            indentation += this._checkbox.W;
        } else {
            if (this._icon != null) {
                this._icon.Layout(this.Controller.NodeHeight, this.Controller.NodeHeight);
                this._icon.SetPosition(indentation, (this.Controller.NodeHeight - this._icon.H) / 2);
            }
            indentation += this.Controller.NodeIndent; //always keep icon size
        }

        // Label
        if (this._label != null) {
            this._label.Layout(Number.POSITIVE_INFINITY, this.Controller.NodeHeight);
            this._label.SetPosition(indentation, (this.Controller.NodeHeight - this._label.H) / 2);
            indentation += this._label.W;
        }

        this.SetSize(indentation, this.Controller.NodeHeight);
    }

    Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        //TODO: only paint expand icon when dirty area is not null
        //Console.WriteLine($"重绘TreeNodeRow[{_label?.Text.Value}]: isHover = {_isHover}");

        if (this._isHover) {
            let paint = PixUI.PaintUtils.Shared(this.Controller.HoverColor);
            canvas.drawRect(
                PixUI.Rect.FromLTWH(0, 0, this.Controller.TreeView!.W, this.Controller.NodeHeight),
                paint);
        }

        TreeNodeRow.PaintChild(this._expander, canvas);
        if (this.Controller.ShowCheckbox)
            TreeNodeRow.PaintChild(this._checkbox, canvas);
        else
            TreeNodeRow.PaintChild(this._icon, canvas);
        TreeNodeRow.PaintChild(this._label, canvas);
    }

    private static PaintChild(child: Nullable<PixUI.Widget>, canvas: PixUI.Canvas) {
        if (child == null) return;

        canvas.translate(child.X, child.Y);
        child.Paint(canvas);
        canvas.translate(-child.X, -child.Y);

        PixUI.PaintDebugger.PaintWidgetBorder(child, canvas);
    }

    toString(): string {
        let labelText = this._label == null ? "" : this._label.Text.Value;
        return `TreeNodeRow[\"${labelText}\"]`;
    }

}
