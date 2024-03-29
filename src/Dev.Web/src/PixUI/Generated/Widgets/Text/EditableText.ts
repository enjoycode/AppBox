import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class EditableText extends PixUI.TextBase implements PixUI.IMouseRegion, PixUI.IFocusable {
    private static readonly $meta_PixUI_IMouseRegion = true;
    private static readonly $meta_PixUI_IFocusable = true;

    public constructor(text: PixUI.State<string>) {
        super(text);
        this.MouseRegion = new PixUI.MouseRegion(() => PixUI.Cursors.IBeam);
        this.MouseRegion.PointerDown.Add(this._OnPointerDown, this);

        this.FocusNode = new PixUI.FocusNode();
        this.FocusNode.FocusChanged.Add(this._OnFocusChanged, this);
        this.FocusNode.TextInput.Add(this._OnTextInput, this);
        this.FocusNode.KeyDown.Add(this._OnKeyDown, this);

        this._caret = new PixUI.Caret(this, this.GetCaretColor.bind(this), this.GetCaretBounds.bind(this));
    }

    private readonly _caret: PixUI.Caret;
    private _caretPosition: number = 0;

    public readonly Focused: PixUI.State<boolean> = PixUI.State.op_Implicit_From(false);

    private _hintParagraph: Nullable<PixUI.Paragraph>;

    private _readonly: Nullable<PixUI.State<boolean>>;

    public get Readonly(): Nullable<PixUI.State<boolean>> {
        return this._readonly;
    }

    public set Readonly(value: Nullable<PixUI.State<boolean>>) {
        this._readonly = this.Rebind(this._readonly, value, PixUI.BindingOptions.None);
    }

    public get IsReadonly(): boolean {
        return this._readonly != null && this._readonly.Value;
    }

    #MouseRegion: PixUI.MouseRegion;
    public get MouseRegion() {
        return this.#MouseRegion;
    }

    private set MouseRegion(value) {
        this.#MouseRegion = value;
    }

    #FocusNode: PixUI.FocusNode;
    public get FocusNode() {
        return this.#FocusNode;
    }

    private set FocusNode(value) {
        this.#FocusNode = value;
    }

    private get FontHeight(): number {
        return (this.FontSize?.Value ?? PixUI.Theme.DefaultFontSize) + 4;
    }

    get ForceHeight(): boolean {
        return true;
    }

    public IsObscure: boolean = false;

    public HintText: Nullable<string>;


    private _OnFocusChanged(focused: boolean) {
        this.Focused.Value = focused;
        if (focused) {
            if (!this.IsReadonly)
                this.Root!.Window.StartTextInput();
            this._caret.Show();
        } else {
            if (!this.IsReadonly)
                this.Root!.Window.StopTextInput();
            this._caret.Hide();
        }
    }

    private _OnTextInput(text: string) {
        if (this.IsReadonly) return;

        if (this.Text.Value != null)
            this.Text.Value = this.Text.Value.Insert(this._caretPosition, text);
        else
            this.Text.Value = text;

        this._caretPosition += text.length;
    }

    private _OnPointerDown(theEvent: PixUI.PointerEvent) {
        let newPos = 0;
        if (this.CachedParagraph != null) {
            let pos = this.CachedParagraph.getGlyphPositionAtCoordinate(theEvent.X, theEvent.Y);
            console.log(`pos=${pos.pos} affinity=${pos.affinity}`);
            newPos = pos.pos;
        }

        if (newPos != this._caretPosition) {
            this._caretPosition = newPos;
            this._caret.NotifyPositionChanged(); //需要通知刷新
        }
    }

    private _OnKeyDown(keyEvent: PixUI.KeyEvent) {
        switch (keyEvent.KeyCode) {
            case PixUI.Keys.Back:
                this.DeleteBack();
                break;
            case PixUI.Keys.Left:
                this.MoveLeft();
                break;
            case PixUI.Keys.Right:
                this.MoveRight();
                break;
        }
    }

    private DeleteBack() {
        if (this.IsReadonly || this._caretPosition == 0) return;

        this.Text.Value = this.Text.Value.Remove(this._caretPosition - 1, 1);
        this._caretPosition--;
    }

    private MoveLeft() {
        if (this._caretPosition == 0) return;

        this._caretPosition--;
        this._caret.NotifyPositionChanged();
    }

    private MoveRight() {
        if (this._caretPosition == this.Text.Value.length)
            return;

        this._caretPosition++;
        this._caret.NotifyPositionChanged();
    }


    public GetCaretBounds(): PixUI.Rect {
        let caretWidth: number = 2;
        let halfCaretWidth: number = caretWidth / 2;

        this.TryBuildParagraph();

        let winPt = this.LocalToWindow(0, 0);
        if (this._caretPosition != 0) {
            if (this._caretPosition == this.Text.Value.length) {
                let textbox = PixUI.GetRectForPosition(this.CachedParagraph!, this._caretPosition - 1, CanvasKit.RectHeightStyle.Tight, CanvasKit.RectWidthStyle.Tight);
                winPt.Offset(textbox.Rect.Left + textbox.Rect.Width, 0);
            } else {
                let textbox = PixUI.GetRectForPosition(this.CachedParagraph!, this._caretPosition, CanvasKit.RectHeightStyle.Tight, CanvasKit.RectWidthStyle.Tight);
                winPt.Offset(textbox.Rect.Left, 0);
            }
        }

        return PixUI.Rect.FromLTWH(winPt.X - halfCaretWidth, winPt.Y, caretWidth, this.H);
    }

    public GetCaretColor(): PixUI.Color {
        return PixUI.Theme.CaretColor;
    } //TODO:


    private TryBuildParagraph() {
        if (this.CachedParagraph != null) return;
        if (this.Text.Value == null || this.Text.Value.length == 0) return;

        let text = this.IsObscure ? '●'.repeat(this.Text.Value.length) : this.Text.Value;
        this.BuildParagraph(text, Number.POSITIVE_INFINITY);
    }

    OnStateChanged(state: PixUI.StateBase, options: PixUI.BindingOptions) {
        if ((state === this._readonly)) {
            if (this.IsReadonly)
                this.Root?.Window.StopTextInput();
            else
                this.Root?.Window.StartTextInput();
            return;
        }

        super.OnStateChanged(state, options);
    }

    Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        this.TryBuildParagraph();
        this.SetSize(width, Math.min(height, this.FontHeight));
    }

    Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        if (this.Text.Value == null || this.Text.Value.length == 0) {
            if (System.IsNullOrEmpty(this.HintText)) return;

            this._hintParagraph ??=
                this.BuildParagraphInternal(this.HintText, Number.POSITIVE_INFINITY, PixUI.Colors.Gray);
            canvas.drawParagraph(this._hintParagraph, 0, 2);
        } else {
            this.TryBuildParagraph();
            if (this.CachedParagraph == null) return;
            canvas.drawParagraph(this.CachedParagraph, 0, 2);
        }
    }

}
