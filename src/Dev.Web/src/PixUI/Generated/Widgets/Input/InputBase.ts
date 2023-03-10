import * as System from '@/System'
import * as PixUI from '@/PixUI'

export abstract class InputBase<T extends PixUI.Widget> extends PixUI.Widget  //, IFocusable
{
    protected constructor(editor: T) {
        super();
        this._editor = editor;
        this._editor.Parent = this;

        this._focusedDecoration = new PixUI.FocusedDecoration(this, this.GetFocusedBorder.bind(this), this.GetUnFocusedBorder.bind(this));
        this._focusedDecoration.AttachFocusChangedEvent(this._editor);
    }

    private static readonly DefaultBorder: PixUI.InputBorder = new PixUI.OutlineInputBorder(null, PixUI.BorderRadius.All(PixUI.Radius.Circular(4)));

    private _prefix: Nullable<PixUI.Widget>;
    private _suffix: Nullable<PixUI.Widget>;
    protected readonly _editor: T;

    private _border: Nullable<PixUI.InputBorder>;
    private _padding: Nullable<PixUI.State<PixUI.EdgeInsets>>;

    private readonly _focusedDecoration: PixUI.FocusedDecoration;

    public get Padding(): Nullable<PixUI.State<PixUI.EdgeInsets>> {
        return this._padding;
    }

    public set Padding(value: Nullable<PixUI.State<PixUI.EdgeInsets>>) {
        this._padding = this.Rebind(this._padding, value, PixUI.BindingOptions.AffectsLayout);
    }

    public abstract get Readonly(): Nullable<PixUI.State<boolean>> ;
    public abstract set Readonly(value: Nullable<PixUI.State<boolean>>);

    public get IsReadonly(): boolean {
        return this.Readonly != null && this.Readonly.Value;
    }

    protected get PrefixWidget(): Nullable<PixUI.Widget> {
        return this._prefix;
    }

    protected set PrefixWidget(value: Nullable<PixUI.Widget>) {
        if (this._prefix != null)
            this._prefix.Parent = null;

        this._prefix = value;
        if (this._prefix == null) return;

        this._prefix.Parent = this;
        if (!this.IsMounted) return;
        this.Invalidate(PixUI.InvalidAction.Relayout);
    }

    protected get SuffixWidget(): Nullable<PixUI.Widget> {
        return this._suffix;
    }

    protected set SuffixWidget(value: Nullable<PixUI.Widget>) {
        if (this._suffix != null)
            this._suffix.Parent = null;

        this._suffix = value;
        if (this._suffix == null) return;

        this._suffix.Parent = this;
        if (!this.IsMounted) return;
        this.Invalidate(PixUI.InvalidAction.Relayout);
    }


    private GetUnFocusedBorder(): Nullable<PixUI.ShapeBorder> {
        return this._border ?? InputBase.DefaultBorder;
    }

    private GetFocusedBorder(): PixUI.ShapeBorder {
        //TODO: others
        let border = this._border ?? InputBase.DefaultBorder;
        if (border instanceof PixUI.OutlineInputBorder) {
            const outline = border;
            return new PixUI.OutlineInputBorder(new PixUI.BorderSide(PixUI.Theme.FocusedColor, PixUI.Theme.FocusedBorderWidth),
                outline.BorderRadius
            );
        }

        throw new System.NotImplementedException();
    }


    OnUnmounted() {
        this._focusedDecoration.StopAndReset();
        super.OnUnmounted();
    }

    VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        if (this._prefix != null)
            if (action(this._prefix))
                return;

        if (action(this._editor)) return;

        if (this._suffix != null)
            action(this._suffix);
    }

    Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);
        let padding = this._padding?.Value ?? PixUI.EdgeInsets.All(4);

        // 扣除padding的宽高
        let lw = width - padding.Horizontal;
        let lh = height - padding.Vertical;
        if (lw <= 0 || lh <= 0) {
            this.SetSize(width, height);
            return;
        }


        // 布局计算子组件
        if (this._prefix != null) {
            this._prefix.Layout(lw, lh);
            lw -= this._prefix.W;
        }

        if (this._suffix != null) {
            this._suffix.Layout(lw, lh);
            lw -= this._suffix.W;
        }

        this._editor.Layout(lw, lh);

        // 设置子组件位置(暂以editor为中心上下居中对齐, TODO:考虑基线对齐)
        let maxChildHeight = this._editor.H;
        this._prefix?.SetPosition(padding.Left, (maxChildHeight - this._prefix.H) / 2 + padding.Top);
        this._suffix?.SetPosition(width - padding.Right - this._suffix.W,
            (maxChildHeight - this._suffix.H) / 2 + padding.Top);
        this._editor.SetPosition(padding.Left + (this._prefix?.W ?? 0), padding.Top + 1);

        // 设置自身宽高
        height = Math.min(height, maxChildHeight + padding.Vertical);
        this.SetSize(width, height);
    }

    Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        let bounds = PixUI.Rect.FromLTWH(0, 0, this.W, this.H);
        let border = this._border ?? InputBase.DefaultBorder;

        //画背景及边框
        border.Paint(canvas, bounds, this.IsReadonly ? PixUI.Theme.DisabledBgColor : PixUI.Colors.White);

        this.PaintChildren(canvas, area);
    }

}
