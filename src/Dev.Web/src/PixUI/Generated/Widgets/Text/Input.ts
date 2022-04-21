import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Input extends PixUI.Widget {
    public constructor(text: PixUI.State<string>) {
        super();
        this._editableText = new PixUI.EditableText(text);
        this._editableText.Parent = this;
        this._focusedDecoration = new PixUI.FocusedDecoration(this, this.GetFocusedBorder.bind(this), this.GetUnFocusedBorder.bind(this));
        this._focusedDecoration.AttachFocusChangedEvent(this._editableText);
    }

    private static readonly DefaultBorder: PixUI.InputBorder = new PixUI.OutlineInputBorder(null, PixUI.BorderRadius.All(PixUI.Radius.Circular(4)));

    private _prefix: Nullable<PixUI.Widget>;
    private _suffix: Nullable<PixUI.Widget>;
    private readonly _editableText: PixUI.EditableText;

    private _border: Nullable<PixUI.InputBorder>;
    private _padding: Nullable<PixUI.State<PixUI.EdgeInsets>>;

    private readonly _focusedDecoration: PixUI.FocusedDecoration;

    public get Padding(): Nullable<PixUI.State<PixUI.EdgeInsets>> {
        return this._padding;
    }

    public set Padding(value: Nullable<PixUI.State<PixUI.EdgeInsets>>) {
        this._padding = this.Rebind(this._padding, value, PixUI.BindingOptions.AffectsLayout);
    }

    public get FontSize(): Nullable<PixUI.State<number>> {
        return this._editableText.FontSize;
    }

    public set FontSize(value: Nullable<PixUI.State<number>>) {
        this._editableText.FontSize = value;
    }

    public get Prefix(): Nullable<PixUI.Widget> {
        return this._prefix;
    }

    public set Prefix(value: Nullable<PixUI.Widget>) {
        if (this._prefix != null)
            this._prefix.Parent = null;

        this._prefix = value;
        if (this._prefix == null) return;

        this._prefix.Parent = this;
        if (!this.IsMounted) return;
        this.Invalidate(PixUI.InvalidAction.Relayout);
    }

    public get Suffix(): Nullable<PixUI.Widget> {
        return this._suffix;
    }

    public set Suffix(value: Nullable<PixUI.Widget>) {
        if (this._suffix != null)
            this._suffix.Parent = null;

        this._suffix = value;
        if (this._suffix == null) return;

        this._suffix.Parent = this;
        if (!this.IsMounted) return;
        this.Invalidate(PixUI.InvalidAction.Relayout);
    }

    public get IsObscure(): boolean {
        return this._editableText.IsObscure;
    }

    public set IsObscure(value: boolean) {
        this._editableText.IsObscure = value;
    }

    public set HintText(value: string) {
        this._editableText.HintText = value;
    }

    private GetUnFocusedBorder(): Nullable<PixUI.ShapeBorder> {
        return this._border ?? Input.DefaultBorder;
    }

    private GetFocusedBorder(): PixUI.ShapeBorder {
        //TODO: others
        let border = this._border ?? Input.DefaultBorder;
        if (border instanceof PixUI.OutlineInputBorder) {
            const outline = border;
            return new PixUI.OutlineInputBorder(new PixUI.BorderSide((PixUI.Theme.FocusedBorderColor).Clone(), PixUI.Theme.FocusedBorderWidth), (outline.BorderRadius
            ).Clone());
        }

        throw new System.NotImplementedException();
    }


    protected OnUnmounted() {
        this._focusedDecoration.StopAndReset();
        super.OnUnmounted();
    }

    public VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        if (this._prefix != null)
            if (action(this._prefix))
                return;

        if (action(this._editableText)) return;

        if (this._suffix != null)
            action(this._suffix);
    }

    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);
        let padding = (this._padding?.Value ?? PixUI.EdgeInsets.All(4)).Clone();

        // 扣除padding的宽高
        let lw = width - padding.Horizontal;
        let lh = height - padding.Vertical;
        if (lw <= 0 || lh <= 0) {
            this.SetSize(width, height);
            return;
        }

        // 设置自身宽高
        let fontHeight = this._editableText.FontHeight;
        height = Math.min(height, fontHeight + padding.Vertical);
        this.SetSize(width, height);

        // prefix
        if (this._prefix != null) {
            this._prefix.Layout(lw, fontHeight);
            this._prefix.SetPosition(padding.Left, padding.Top + (fontHeight - this._prefix.H) / 2);
            lw -= this._prefix.W;
        }

        // suffix
        if (this._suffix != null) {
            this._suffix.Layout(lw, fontHeight);
            this._suffix.SetPosition(width - padding.Right - this._suffix.W, padding.Top + (fontHeight - this._suffix.H) / 2);
            lw -= this._suffix.W;
        }

        // editableText
        this._editableText.Layout(lw, lh);
        this._editableText.SetPosition(padding.Left + (this._prefix?.W ?? 0), padding.Top);
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        let padding = (this._padding?.Value ?? PixUI.EdgeInsets.All(4)).Clone();
        let border = this._border ?? Input.DefaultBorder;

        //画边框
        border.Paint(canvas, PixUI.Rect.FromLTWH(0, 0, this.W, this.H));

        this.PaintChildren(canvas, area);
    }

    public Init(props: Partial<Input>): Input {
        Object.assign(this, props);
        return this;
    }

}
