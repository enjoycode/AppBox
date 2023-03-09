import * as System from '@/System'
import * as CodeEditor from '@/CodeEditor'

export class SelectionManager {
    public constructor(editor: CodeEditor.TextEditor) {
        this._textEditor = editor;
        this.SelectionCollection = new System.List<CodeEditor.Selection>();
        this.SelectFrom = new SelectFrom();
        this.SelectionStart = (CodeEditor.TextLocation.Empty).Clone();
    }

    private readonly _textEditor: CodeEditor.TextEditor;
    public readonly SelectionCollection: System.IList<CodeEditor.Selection>;

    public SelectFrom: SelectFrom;
    public SelectionStart: CodeEditor.TextLocation = CodeEditor.TextLocation.Empty.Clone();

    public readonly SelectionChanged = new System.Event();

    public get HasSomethingSelected(): boolean {
        return this.SelectionCollection.length > 0;
    }

    public get SelectionIsReadonly(): boolean {
        return false;
    } //TODO:

    public get SelectedText(): string {
        if (!this.HasSomethingSelected) return '';
        if (this.SelectionCollection.length == 1)
            return this.SelectionCollection[0].SelectedText;

        let res = "";
        for (const selection of this.SelectionCollection) {
            res += selection.SelectedText;
        }

        return res;
    }

    public SetSelection(startPosition: CodeEditor.TextLocation, endPosition: CodeEditor.TextLocation) {
        if (this.SelectionCollection.length == 1 &&
            System.OpEquality(this.SelectionCollection[0].StartPosition, startPosition) &&
            System.OpEquality(this.SelectionCollection[0].EndPosition, endPosition))
            return;

        this.SelectionCollection.Clear(); //clearWithoutUpdate();
        this.SelectionCollection.Add(new CodeEditor.Selection(this._textEditor.Document, (startPosition).Clone(),
            (endPosition).Clone()));
        this.SelectionChanged.Invoke();
    }

    public ClearSelection() {
        let mousePos = (this._textEditor.PointerPos).Clone();

        // this is the most logical place to reset selection starting
        // positions because it is always called before a new selection
        this.SelectFrom.First = this.SelectFrom.Where;
        let newSelectionStart = this._textEditor.TextView.GetLogicalPosition(
            mousePos.X - this._textEditor.TextView.Bounds.Left,
            mousePos.Y - this._textEditor.TextView.Bounds.Top);

        if (this.SelectFrom.Where == WhereFrom.Gutter) {
            newSelectionStart.Column = 0;
            //selectionStart.Y = -1;
        }

        if (newSelectionStart.Line >= this._textEditor.Document.TotalNumberOfLines) {
            newSelectionStart.Line = this._textEditor.Document.TotalNumberOfLines - 1;
            newSelectionStart.Column =
                this._textEditor.Document.GetLineSegment(this._textEditor.Document.TotalNumberOfLines - 1)
                    .Length;
        }

        this.SelectionStart = (newSelectionStart).Clone();
        this.SelectionCollection.Clear(); //clearWithoutUpdate();
        this.SelectionChanged.Invoke();
    }

    public RemoveSelectedText() {
        if (this.SelectionIsReadonly) {
            this.ClearSelection();
            return;
        }

        // var lines = new List<int>();
        let oneLine = true;
        for (const s of this.SelectionCollection) {
            if (oneLine) {
                let lineBegin = s.StartPosition.Line;
                if (lineBegin != s.EndPosition.Line)
                    oneLine = false;
                // else
                //     lines.Add(lineBegin);
            }

            let offset = s.Offset;
            this._textEditor.Document.Remove(offset, s.Length);
        }

        this.ClearSelection();
        // if (offset >= 0)
        // {
        //     //textArea.caret.offset = offset;
        // }
    }

    public ExtendSelection(oldPosition: CodeEditor.TextLocation, newPosition: CodeEditor.TextLocation) {
        // where old position is where the cursor was,
        // and new position is where it has ended up from a click (both zero based)
        if (System.OpEquality(oldPosition, newPosition)) return;

        let min: CodeEditor.TextLocation = CodeEditor.TextLocation.Empty.Clone();
        let max: CodeEditor.TextLocation = CodeEditor.TextLocation.Empty.Clone();
        let oldnewX = newPosition.Column;
        let oldIsGreater = SelectionManager.GreaterEqPos((oldPosition).Clone(), (newPosition).Clone());
        if (oldIsGreater) {
            min = (newPosition).Clone();
            max = (oldPosition).Clone();
        } else {
            min = (oldPosition).Clone();
            max = (newPosition).Clone();
        }

        if (System.OpEquality(min, max)) return;

        if (!this.HasSomethingSelected) {
            this.SetSelection((min).Clone(), (max).Clone());
            // initialise selectFrom for a cursor selection
            if (this.SelectFrom.Where == WhereFrom.None)
                this.SelectionStart = (oldPosition).Clone(); //textArea.Caret.Position;
            return;
        }

        let selection = this.SelectionCollection[0];
        // changed selection via gutter
        if (this.SelectFrom.Where == WhereFrom.Gutter) {
            // selection new position is always at the left edge for gutter selections
            newPosition.Column = 0;
        }

        if (SelectionManager.GreaterEqPos((newPosition).Clone(), (this.SelectionStart).Clone())) {
            // selecting forward
            selection.StartPosition = (this.SelectionStart).Clone();
            // this handles last line selection
            if (this.SelectFrom.Where == WhereFrom.Gutter) {
                selection.EndPosition =
                    new CodeEditor.TextLocation(this._textEditor.Caret.Column, this._textEditor.Caret.Line);
            } else {
                newPosition.Column = oldnewX;
                selection.EndPosition = (newPosition).Clone();
            }
        } else {
            // selecting back
            if (this.SelectFrom.Where == WhereFrom.Gutter && this.SelectFrom.First == WhereFrom.Gutter) {
                // gutter selection
                selection.EndPosition = this.NextValidPosition(this.SelectionStart.Line);
            } else {
                // internal text selection
                selection.EndPosition = (this.SelectionStart).Clone(); //selection.StartPosition;
            }

            selection.StartPosition = (newPosition).Clone();
        }

        this.SelectionChanged.Invoke();
    }

    public NextValidPosition(line: number): CodeEditor.TextLocation {
        if (line < this._textEditor.Document.TotalNumberOfLines - 1)
            return new CodeEditor.TextLocation(0, line + 1);
        return new CodeEditor.TextLocation(this._textEditor.Document.GetLineSegment(this._textEditor.Document.TotalNumberOfLines - 1)
            .Length + 1,
            line);
    }

    public static GreaterEqPos(p1: CodeEditor.TextLocation, p2: CodeEditor.TextLocation): boolean {
        return p1.Line > p2.Line || p1.Line == p2.Line && p1.Column >= p2.Column;
    }
}

export enum WhereFrom {
    None,
    Gutter,
    TextArea
}

export class SelectFrom {
    public Where: WhereFrom = WhereFrom.None;
    public First: WhereFrom = WhereFrom.None;
}
