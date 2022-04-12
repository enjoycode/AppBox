import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class EditableText extends PixUI.TextBase implements PixUI.IMouseRegion, PixUI.IFocusable {
    private static readonly $meta_PixUI_IMouseRegion = true;
    private static readonly $meta_PixUI_IFocusable = true;
    private readonly _caret: PixUI.Caret;
    private _caretPosition: number = 0;

    public readonly Focused: PixUI.State<boolean> = PixUI.State.op_Implicit_From(false);

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

    public get FontHeight(): number {
        return (this.FontSize?.Value ?? PixUI.Theme.DefaultFontSize) + 4;
    }

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


    private _OnFocusChanged(focused: boolean) {
        this.Focused.Value = focused;
        if (focused) {
            this.Root!.Window.StartTextInput();
            this._caret.Show();
        } else {
            this.Root!.Window.StopTextInput();
            this._caret.Hide();
        }
    }

    private _OnTextInput(text: string) {
        this.Text.Value = this.Text.Value.Insert(this._caretPosition, text);
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
        if (this._caretPosition == 0) return;

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

        let winPt = this.LocalToWindow(0, 0);
        if (this._caretPosition == this.Text.Value.length) {
            let textbox = PixUI.Utils.GetRectForPosition(this.CachedParagraph!, this._caretPosition - 1, CanvasKit.RectHeightStyle.Tight, CanvasKit.RectWidthStyle.Tight);
            winPt.Offset(textbox.Rect.Left + textbox.Rect.Width, 0);
        } else if (this._caretPosition != 0) {
            let textbox = PixUI.Utils.GetRectForPosition(this.CachedParagraph!, this._caretPosition, CanvasKit.RectHeightStyle.Tight, CanvasKit.RectWidthStyle.Tight);
            winPt.Offset(textbox.Rect.Left, 0);
        }

        return PixUI.Rect.FromLTWH(winPt.X - halfCaretWidth, winPt.Y, caretWidth, this.H);
    }

    public GetCaretColor(): PixUI.Color {
        return PixUI.Theme.CaretColor;
    } //TODO:


    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        this.BuildParagraph(Number.POSITIVE_INFINITY);
        this.SetSize(width, Math.min(height, this.FontHeight));
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        if (this.CachedParagraph == null) return;

        canvas.drawParagraph(this.CachedParagraph, 0, 2);
    }

    public Init(props: Partial<EditableText>): EditableText {
        Object.assign(this, props);
        return this;
    }

}
