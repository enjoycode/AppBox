import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class CodeEditorController {
    public constructor(fileName: string, content: string) {
        this.Theme = new CodeEditor.TextEditorTheme();
        this.Document = new CodeEditor.Document(fileName);
        this.TextEditor = new CodeEditor.TextEditor(this);

        this.Document.TextContent = content;

        this.Document.DocumentChanged.Add(this._OnDocumentChanged, this);
        this.TextEditor.Caret.PositionChanged.Add(this._OnCaretPositionChanged, this);
    }

    public readonly Document: CodeEditor.Document;
    public readonly TextEditor: CodeEditor.TextEditor;
    public readonly Theme: CodeEditor.TextEditorTheme;

    public RequestInvalidate: Nullable<System.Action2<boolean, Nullable<PixUI.IDirtyArea>>>;

    // 全局命令字典表
    private readonly _editActions: System.NumberMap<CodeEditor.IEditCommand> = new System.NumberMap<CodeEditor.IEditCommand>([[<number><unknown>PixUI.Keys.Left, new CodeEditor.CaretLeft()], [<number><unknown>PixUI.Keys.Right, new CodeEditor.CaretRight()], [<number><unknown>PixUI.Keys.Up, new CodeEditor.CaretUp()], [<number><unknown>PixUI.Keys.Down, new CodeEditor.CaretDown()], [<number><unknown>PixUI.Keys.Back, new CodeEditor.BackspaceCommand()], [<number><unknown>PixUI.Keys.Return, new CodeEditor.ReturnCommand()], [<number><unknown>PixUI.Keys.Tab, new CodeEditor.TabCommand()], [<number><unknown>(PixUI.Keys.Control | PixUI.Keys.Z), new CodeEditor.UndoCommand()], [<number><unknown>(PixUI.Keys.Control | PixUI.Keys.Y), new CodeEditor.RedoCommand()]]);


    private _mouseDownPos: PixUI.Point = PixUI.Point.Empty;
    private _gotMouseDown: boolean = false; //primary button is down
    private _doDragDrop: boolean = false;
    private _minSelection: CodeEditor.TextLocation = (CodeEditor.TextLocation.Empty).Clone();
    private _maxSelection: CodeEditor.TextLocation = (CodeEditor.TextLocation.Empty).Clone();

    public OnPointerDown(e: PixUI.PointerEvent) {
        // this corrects weird problems when text is selected,
        // then a menu item is selected, then the text is
        // clicked again - it correctly synchronises the click position
        this.TextEditor.PointerPos.X = e.X;
        this.TextEditor.PointerPos.Y = e.Y;

        for (const area of this.TextEditor.LeftAreas) {
            if (area.Bounds.ContainsPoint(e.X, e.Y))
                area.HandlePointerDown(e.X, e.Y, e.Buttons);
        }

        if (this.TextEditor.TextView.Bounds.ContainsPoint(e.X, e.Y)) {
            this._gotMouseDown = true;
            this.TextEditor.SelectionManager.SelectFrom.Where = CodeEditor.WhereFrom.TextArea;
            this._mouseDownPos = new PixUI.Point(e.X, e.Y);
            this._minSelection = (CodeEditor.TextLocation.Empty).Clone();
            this._maxSelection = (CodeEditor.TextLocation.Empty).Clone();

            let vx = e.X - this.TextEditor.TextView.Bounds.Left;
            let vy = e.Y - this.TextEditor.TextView.Bounds.Top;
            if (e.Buttons == PixUI.PointerButtons.Left) {
                let logicalLine = this.TextEditor.TextView.GetLogicalLine(vy);
                let logicalColumn = this.TextEditor.TextView.GetLogicalColumn(logicalLine, vx);

                console.log(`CodeEditor Hit: ${logicalColumn.Location}`);

                this.TextEditor.SelectionManager.ClearSelection();
                this.TextEditor.Caret.Position = (logicalColumn.Location).Clone();
            }
        }
    }

    public OnPointerUp(e: PixUI.PointerEvent) {
        this.TextEditor.SelectionManager.SelectFrom.Where = CodeEditor.WhereFrom.None;
        this._gotMouseDown = false;
        this._mouseDownPos = new PixUI.Point(-1, -1);
    }

    public OnPointerMove(e: PixUI.PointerEvent) {
        this.TextEditor.PointerPos.X = e.X;
        this.TextEditor.PointerPos.Y = e.Y;

        if (e.Buttons == PixUI.PointerButtons.Left) {
            if (this._gotMouseDown &&
                this.TextEditor.SelectionManager.SelectFrom.Where == CodeEditor.WhereFrom.TextArea) {
                this.ExtendSelectionToPointer();
            }
        }
    }

    public OnKeyDown(e: PixUI.KeyEvent) {
        let cmd = this._editActions.get((Math.floor(e.KeyData) & 0xFFFFFFFF));
        cmd?.Execute(this.TextEditor);
    }

    public OnTextInput(text: string) {
        this.TextEditor.InsertOrReplaceString(text, 0);
    }

    private ExtendSelectionToPointer() {
        let mousePos = (this.TextEditor.PointerPos).Clone();
        let realMousePos = this.TextEditor.TextView.GetLogicalPosition(
            Math.max(0, mousePos.X - this.TextEditor.TextView.Bounds.Left), mousePos.Y - this.TextEditor.TextView.Bounds.Top);
        let y = realMousePos.Line;
        //realMousePos = TextEditor.Caret.ValidatePosition(realMousePos);
        let oldPos = (this.TextEditor.Caret.Position).Clone();
        if (System.OpEquality(oldPos, realMousePos) &&
            this.TextEditor.SelectionManager.SelectFrom.Where != CodeEditor.WhereFrom.Gutter)
            return;

        // the selection is from the gutter
        if (this.TextEditor.SelectionManager.SelectFrom.Where == CodeEditor.WhereFrom.Gutter) {
            if (realMousePos.Line < this.TextEditor.SelectionManager.SelectionStart.Line) {
                // the selection has moved above the start point
                this.TextEditor.Caret.Position = new CodeEditor.TextLocation(0, realMousePos.Line);
            } else {
                // the selection has moved below the start point
                this.TextEditor.Caret.Position =
                    this.TextEditor.SelectionManager.NextValidPosition(realMousePos.Line);
            }
        } else {
            this.TextEditor.Caret.Position = (realMousePos).Clone();
        }

        // moves selection across whole words for double-click initiated selection
        if (!this._minSelection.IsEmpty &&
            this.TextEditor.SelectionManager.HasSomethingSelected &&
            this.TextEditor.SelectionManager.SelectFrom.Where == CodeEditor.WhereFrom.TextArea) {
            // Extend selection when selection was started with double-click
            let selection = this.TextEditor.SelectionManager.SelectionCollection[0];
            let min = (CodeEditor.SelectionManager.GreaterEqPos((this._minSelection).Clone(), (this._maxSelection).Clone())
                ? this._maxSelection
                : this._minSelection).Clone();
            let max = (CodeEditor.SelectionManager.GreaterEqPos((this._minSelection).Clone(), (this._maxSelection).Clone())
                ? this._minSelection
                : this._maxSelection).Clone();
            if (CodeEditor.SelectionManager.GreaterEqPos((max).Clone(), (realMousePos).Clone()) &&
                CodeEditor.SelectionManager.GreaterEqPos((realMousePos).Clone(), (min).Clone())) {
                this.TextEditor.SelectionManager.SetSelection((min).Clone(), (max).Clone());
            } else if (CodeEditor.SelectionManager.GreaterEqPos((max).Clone(), (realMousePos).Clone())) {
                let moff = this.TextEditor.Document.PositionToOffset((realMousePos).Clone());
                min = this.TextEditor.Document
                    .OffsetToPosition(CodeEditorController.FindWordStart(this.TextEditor.Document, moff));
                this.TextEditor.SelectionManager.SetSelection((min).Clone(), (max).Clone());
            } else {
                let moff = this.TextEditor.Document.PositionToOffset((realMousePos).Clone());
                max = this.TextEditor.Document
                    .OffsetToPosition(CodeEditorController.FindWordEnd(this.TextEditor.Document, moff));
                this.TextEditor.SelectionManager.SetSelection((min).Clone(), (max).Clone());
            }
        } else {
            this.TextEditor.SelectionManager
                .ExtendSelection((oldPos).Clone(), (this.TextEditor.Caret.Position).Clone());
        }
        //textArea.SetDesiredColumn();
    }


    private _OnDocumentChanged(e: CodeEditor.DocumentEventArgs) {
        //TODO: 进一步合并LineManager改变的行数
        let dirtyLines = this.Document.SyntaxParser.GetDirtyLines(this);
        this.RequestInvalidate?.call(this, true, dirtyLines);
    }

    private _OnCaretPositionChanged() {
        //TODO: set IME input rect

        this.RequestInvalidate?.call(this, false, null);
    }


    private static IsSelectableChar(c: number): boolean {
        return !CodeEditorController.IsWhiteSpace(c);
    }

    private static IsWhiteSpace(c: number): boolean {
        return c == 32;
    }

    private static FindWordStart(document: CodeEditor.Document, offset: number): number {
        let line = document.GetLineSegmentForOffset(offset);

        if (offset > 0 &&
            CodeEditorController.IsWhiteSpace(document.GetCharAt(offset - 1)) &&
            CodeEditorController.IsWhiteSpace(document.GetCharAt(offset))) {
            while (offset > line.Offset &&
            CodeEditorController.IsWhiteSpace(document.GetCharAt(offset - 1))) {
                --offset;
            }
        } else if (CodeEditorController.IsSelectableChar(document.GetCharAt(offset)) ||
            (offset > 0 &&
                CodeEditorController.IsWhiteSpace(document.GetCharAt(offset)) &&
                CodeEditorController.IsSelectableChar(document.GetCharAt(offset - 1)))) {
            while (offset > line.Offset &&
            CodeEditorController.IsSelectableChar(document.GetCharAt(offset - 1))) {
                --offset;
            }
        } else {
            if (offset > 0 &&
                !CodeEditorController.IsWhiteSpace(document.GetCharAt(offset - 1)) &&
                !CodeEditorController.IsSelectableChar(document.GetCharAt(offset - 1))) {
                return Math.max(0, offset - 1);
            }
        }

        return offset;
    }

    private static FindWordEnd(document: CodeEditor.Document, offset: number): number {
        let line = document.GetLineSegmentForOffset(offset);
        if (line.Length == 0) return offset;
        let endPos = line.Offset + line.Length;
        offset = Math.min(offset, endPos - 1);

        if (CodeEditorController.IsSelectableChar(document.GetCharAt(offset))) {
            while (
                offset < endPos && CodeEditorController.IsSelectableChar(document.GetCharAt(offset))) {
                ++offset;
            }
        } else if (CodeEditorController.IsWhiteSpace(document.GetCharAt(offset))) {
            if (offset > 0 && CodeEditorController.IsWhiteSpace(document.GetCharAt(offset - 1))) {
                while (offset < endPos && CodeEditorController.IsWhiteSpace(document.GetCharAt(offset))) {
                    ++offset;
                }
            }
        } else {
            return Math.max(0, offset + 1);
        }

        return offset;
    }

    public Init(props: Partial<CodeEditorController>): CodeEditorController {
        Object.assign(this, props);
        return this;
    }

}
