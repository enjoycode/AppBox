import * as CodeEditor from '@/CodeEditor'
import * as PixUI from '@/PixUI'

export class CodeEditorWidget extends PixUI.Widget implements PixUI.IMouseRegion, PixUI.IFocusable, PixUI.IScrollable {
    private static readonly $meta_PixUI_IMouseRegion = true;
    private static readonly $meta_PixUI_IFocusable = true;
    private static readonly $meta_PixUI_IScrollable = true;

    public constructor(controller: CodeEditor.CodeEditorController) {
        super();
        this.MouseRegion = new PixUI.MouseRegion();
        this.FocusNode = new PixUI.FocusNode();

        this.Controller = controller;
        this.Controller.AttachWidget(this);
        this._decoration = new CodeEditor.EditorDecorator(this);

        this.MouseRegion.PointerDown.Add(this.Controller.OnPointerDown, this.Controller);
        this.MouseRegion.PointerUp.Add(this.Controller.OnPointerUp, this.Controller);
        this.MouseRegion.PointerMove.Add(this.Controller.OnPointerMove, this.Controller);
        this.FocusNode.FocusChanged.Add(this._OnFocusChanged, this);
        this.FocusNode.KeyDown.Add(this.Controller.OnKeyDown, this.Controller);
        this.FocusNode.TextInput.Add(this.Controller.OnTextInput, this.Controller);
    }

    public readonly Controller: CodeEditor.CodeEditorController;
    private readonly _decoration: CodeEditor.EditorDecorator;

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

    public get ScrollOffsetX(): number {
        return this.Controller.TextEditor.VirtualTop.X;
    }

    public get ScrollOffsetY(): number {
        return this.Controller.TextEditor.VirtualTop.Y;
    }


    public RequestInvalidate(all: boolean, dirtyArea: Nullable<PixUI.IDirtyArea>) {
        if (all)
            this.Invalidate(PixUI.InvalidAction.Repaint, dirtyArea);
        else
            this._decoration.Invalidate(PixUI.InvalidAction.Repaint);
    }

    private _OnFocusChanged(focused: boolean) {
        // Focused.Value = focused;
        if (focused)
            this.Root!.Window.StartTextInput();
        else
            this.Root!.Window.StopTextInput();
    }

    public OnScroll(dx: number, dy: number): PixUI.Offset {
        return this.Controller.OnScroll(dx, dy);
    }

    OnMounted() {
        this.Overlay!.Show(this._decoration);
        super.OnMounted();
    }

    OnUnmounted() {
        if (this._decoration.Parent != null)
            (<PixUI.Overlay><unknown>this._decoration.Parent).Remove(this._decoration);
        super.OnUnmounted();
    }


    get IsOpaque(): boolean {
        return true;
    }

    Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);
        this.SetSize(width, height);
    }

    Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        let clipRect = PixUI.Rect.FromLTWH(0, 0, this.W, this.H);
        canvas.save();
        canvas.clipRect(clipRect, CanvasKit.ClipOp.Intersect, false);
        this.Controller.TextEditor.Paint(canvas, new PixUI.Size(this.W, this.H), area);
        canvas.restore();
    }

}
