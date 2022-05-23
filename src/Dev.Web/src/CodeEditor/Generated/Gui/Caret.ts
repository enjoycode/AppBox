import * as PixUI from '@/PixUI'
import * as System from '@/System'
import * as CodeEditor from '@/CodeEditor'

export enum CaretMode {
    InsertMode,
    OverwriteMode
}

export class Caret {
    public constructor(editor: CodeEditor.TextEditor) {
        this._textEditor = editor;
    }

    private readonly _textEditor: CodeEditor.TextEditor;
    private _line: number = 0;

    private _column: number = 0;

    // private int _oldLine = -1;

    public get Line(): number {
        return this._line;
    }

    public set Line(value: number) {
        if (this._line != value) {
            this._line = value;
            this.ValidateCaretPos();
            this.UpdateCaretPosition();
            this.OnPositionChanged();
        }
    }

    public get Column(): number {
        return this._column;
    }

    public set Column(value: number) {
        if (this._column != value) {
            this._column = value;
            this.ValidateCaretPos();
            this.UpdateCaretPosition();
            this.OnPositionChanged();
        }
    }

    private _caretPosX: number = 0;
    private _caretPosY: number = 0;

    private _currentPos: CodeEditor.TextLocation = new CodeEditor.TextLocation(-1, -1);

    private _desiredXPos: number = 0;

    public Mode: CaretMode = CaretMode.InsertMode;

    public get CanvasPosX(): number {
        return this._textEditor.TextView.Bounds.Left + this._caretPosX - this._textEditor.VirtualTop.X -
            0.5;
    }

    public get CanvasPosY(): number {
        return this._textEditor.TextView.Bounds.Top + this._caretPosY - this._textEditor.VirtualTop.Y;
    }

    public get Position(): CodeEditor.TextLocation {
        return new CodeEditor.TextLocation(this._column, this._line);
    }

    public set Position(value: CodeEditor.TextLocation) {
        if (this._line != value.Line || this._column != value.Column) {
            this._line = value.Line;
            this._column = value.Column;
            this.UpdateCaretPosition();
            this.OnPositionChanged();
        }
    }

    public get Offset(): number {
        return this._textEditor.Document.PositionToOffset((this.Position).Clone());
    }

    public readonly PositionChanged = new System.Event();

    public ValidatePosition(pos: CodeEditor.TextLocation): CodeEditor.TextLocation {
        let line = Math.max(0, Math.min(this._textEditor.Document.TotalNumberOfLines - 1, pos.Line));
        let column = Math.max(0, pos.Column);

        if (column >= CodeEditor.TextLocation.MaxColumn ||
            !this._textEditor.Document.TextEditorOptions.AllowCaretBeyondEOL) {
            let lineSegment = this._textEditor.Document.GetLineSegment(line);
            column = Math.min(column, lineSegment.Length);
        }

        return new CodeEditor.TextLocation(column, line);
    }

    private ValidateCaretPos() {
        this._line = Math.max(0, Math.min(this._textEditor.Document.TotalNumberOfLines - 1, this._line));
        this._column = Math.max(0, this._column);

        if (this._column >= CodeEditor.TextLocation.MaxColumn ||
            !this._textEditor.Document.TextEditorOptions.AllowCaretBeyondEOL) {
            let lineSegment = this._textEditor.Document.GetLineSegment(this._line);
            this._column = Math.min(this._column, lineSegment.Length);
        }
    }

    public UpdateCaretPosition() {
        // _oldLine = _line;

        this.ValidateCaretPos();

        this._caretPosX = this._textEditor.TextView.GetDrawingXPos(this._line, this._column) +
            this._textEditor.VirtualTop.X;
        this._caretPosY = this._textEditor.Document.GetVisibleLine(this._line) *
            this._textEditor.TextView.FontHeight;

        // Console.WriteLine(
        //     "UpdateCaretPosition: line=$_line col=$_column offset=$Offset x=$_caretPosX y=$_caretPosY");
    }

    private OnPositionChanged() {
        this.PositionChanged.Invoke();
        //TODO: _textArea.ScrollToCaret();
    }

    public Paint(canvas: PixUI.Canvas) {
        let fontHeight = this._textEditor.TextView.FontHeight;
        let textViewArea = (this._textEditor.TextView.Bounds).Clone();

        // draw caret
        let cx = this.CanvasPosX;
        let cy = this.CanvasPosY;
        if (cx >= textViewArea.Left - 0.5) {
            let paint = PixUI.PaintUtils.Shared(this._textEditor.Theme.CaretColor);
            canvas.drawRect(PixUI.Rect.FromLTWH(cx, cy, 2, fontHeight), paint);
        }

        // draw highlight background
        let bgPaint = PixUI.PaintUtils.Shared(this._textEditor.Theme.LineHighlightColor);
        canvas.drawRect(PixUI.Rect.FromLTWH(textViewArea.Left, cy, textViewArea.Width, fontHeight), bgPaint);
    }

    public Init(props: Partial<Caret>): Caret {
        Object.assign(this, props);
        return this;
    }
}
