import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class TreeNodeRow<T> extends PixUI.Widget implements PixUI.IMouseRegion {
    private static readonly $meta_PixUI_IMouseRegion = true;
    private _expander: Nullable<PixUI.ExpandIcon>;
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

    public constructor() {
        super();
        this.MouseRegion = new PixUI.MouseRegion(null, false); //TODO: opaque=true
        this.MouseRegion.HoverChanged.Add(this._OnHoverChanged, this);
    }

    private _OnHoverChanged(hover: boolean) {
        this._isHover = hover;
        this.Invalidate(PixUI.InvalidAction.Repaint, new PixUI.RepaintArea(PixUI.Rect.FromLTWH(0, 0, Number.MAX_VALUE, this.Controller.NodeHeight)));
    }

    public set ExpandIcon(value: PixUI.ExpandIcon) {
        this._expander = value;
        this._expander.Parent = this;
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
        return <PixUI.TreeNode<T>><any>this.Parent!;
    }

    private get Controller(): PixUI.TreeController<T> {
        return this.TreeNode.Controller;
    }


    public get IsOpaque(): boolean {
        return this._isHover && this.Controller.HoverColor.Alpha == 0xFF;
    }

    public ContainsPoint(x: number, y: number): boolean {
        return y >= 0 && y < this.H;
    }

    public HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        if (y < 0 || y > this.H) return false;

        result.Add(this);

        //子级只需要判断是否命中ExpandIcon
        if (this._expander != null)
            this.HitTestChild(this._expander, x, y, result);

        return true;
    }

    public Layout(availableWidth: number, availableHeight: number) {
        let indentation = this.TreeNode.Depth * this.Controller.NodeIndent;

        // ExpandIcon
        if (this._expander != null) {
            this._expander?.Layout(this.Controller.NodeHeight, this.Controller.NodeHeight);
            this._expander?.SetPosition(indentation, (this.Controller.NodeHeight - this._expander.H) / 2);
        }

        indentation += this.Controller.NodeIndent; //always keep expand icon size

        // Icon
        if (this._icon != null) {
            this._icon.Layout(this.Controller.NodeHeight, this.Controller.NodeHeight);
            this._icon.SetPosition(indentation, (this.Controller.NodeHeight - this._icon.H) / 2);
        }

        indentation += this.Controller.NodeIndent; //always keep icon size

        // Label
        if (this._label != null) {
            this._label.Layout(Number.POSITIVE_INFINITY, this.Controller.NodeHeight);
            this._label.SetPosition(indentation, (this.Controller.NodeHeight - this._label.H) / 2);
            indentation += this._label.W;
        }

        this.SetSize(indentation, this.Controller.NodeHeight);
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        //TODO: only paint expand icon when dirty area is not null

        if (this._isHover) {
            let paint = PixUI.PaintUtils.Shared(this.Controller.HoverColor);
            canvas.drawRect(PixUI.Rect.FromLTWH(0, 0, this.TreeNode.TreeView!.W, this.Controller.NodeHeight), paint);
        }

        TreeNodeRow.PaintChild(this._expander, canvas);
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

    public ToString(): string {
        let labelText = this._label == null ? "" : this._label.Text.Value;
        return `TreeNodeRow[\"${labelText}\"]`;
    }

    public Init(props: Partial<TreeNodeRow<T>>): TreeNodeRow<T> {
        Object.assign(this, props);
        return this;
    }

}
