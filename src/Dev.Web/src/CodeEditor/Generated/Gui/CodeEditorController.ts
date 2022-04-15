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

    public RequestInvalidate: Nullable<System.Action<boolean, Nullable<PixUI.IDirtyArea>>>;

    // 全局命令字典表
    private readonly _editActions: System.NumberMap<CodeEditor.IEditCommand> = new System.NumberMap<CodeEditor.IEditCommand>([[<number><any>PixUI.Keys.Left, new CodeEditor.CaretLeft()], [<number><any>PixUI.Keys.Right, new CodeEditor.CaretRight()], [<number><any>PixUI.Keys.Up, new CodeEditor.CaretUp()], [<number><any>PixUI.Keys.Down, new CodeEditor.CaretDown()], [<number><any>PixUI.Keys.Back, new CodeEditor.BackspaceCommand()], [<number><any>PixUI.Keys.Return, new CodeEditor.ReturnCommand()], [<number><any>PixUI.Keys.Tab, new CodeEditor.TabCommand()], [<number><any>(PixUI.Keys.Control | PixUI.Keys.Z), new CodeEditor.UndoCommand()], [<number><any>(PixUI.Keys.Control | PixUI.Keys.Y), new CodeEditor.RedoCommand()]]);


    private _mouseDownPos: PixUI.Point = PixUI.Point.Empty;
    private _gotMouseDown: boolean = false; //primary button is down
    private _doDragDrop: boolean = false;
    private _minSelection: CodeEditor.TextLocation = CodeEditor.TextLocation.Empty;
    private _maxSelection: CodeEditor.TextLocation = CodeEditor.TextLocation.Empty;

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
            this._minSelection = CodeEditor.TextLocation.Empty;
            this._maxSelection = CodeEditor.TextLocation.Empty;

            let vx = e.X - this.TextEditor.TextView.Bounds.Left;
            let vy = e.Y - this.TextEditor.TextView.Bounds.Top;
            if (e.Buttons == PixUI.PointerButtons.Left) {
                let logicalLine = this.TextEditor.TextView.GetLogicalLine(vy);
                let logicalColumn = this.TextEditor.TextView.GetLogicalColumn(logicalLine, vx);

                console.log(`CodeEditor Hit: ${logicalColumn.Location}`);

                this.TextEditor.SelectionManager.ClearSelection();
                this.TextEditor.Caret.Position = logicalColumn.Location;
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
        let cmd = this._editActions.get(<number><any>e.KeyData);
        cmd?.Execute(this.TextEditor);
    }

    public OnTextInput(text: string) {
        this.TextEditor.InsertOrReplaceString(text, 0);
    }

    private ExtendSelectionToPointer() {
        let mousePos = this.TextEditor.PointerPos;
        let realMousePos = this.TextEditor.TextView.GetLogicalPosition(
            Math.max(0, mousePos.X - this.TextEditor.TextView.Bounds.Left), mousePos.Y - this.TextEditor.TextView.Bounds.Top);
        let y = realMousePos.Line;
        //realMousePos = TextEditor.Caret.ValidatePosition(realMousePos);
        let oldPos = this.TextEditor.Caret.Position;
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
            this.TextEditor.Caret.Position = realMousePos;
        }

        // moves selection across whole words for double-click initiated selection
        if (!this._minSelection.IsEmpty &&
            this.TextEditor.SelectionManager.HasSomethingSelected &&
            this.TextEditor.SelectionManager.SelectFrom.Where == CodeEditor.WhereFrom.TextArea) {
            // Extend selection when selection was started with double-click
            let selection = this.TextEditor.SelectionManager.SelectionCollection[0];
            let min = CodeEditor.SelectionManager.GreaterEqPos(this._minSelection, this._maxSelection)
                ? this._maxSelection
                : this._minSelection;
            let max = CodeEditor.SelectionManager.GreaterEqPos(this._minSelection, this._maxSelection)
                ? this._minSelection
                : this._maxSelection;
            if (CodeEditor.SelectionManager.GreaterEqPos(max, realMousePos) &&
                CodeEditor.SelectionManager.GreaterEqPos(realMousePos, min)) {
                this.TextEditor.SelectionManager.SetSelection(min, max);
            } else if (CodeEditor.SelectionManager.GreaterEqPos(max, realMousePos)) {
                let moff = this.TextEditor.Document.PositionToOffset(realMousePos);
                min = this.TextEditor.Document
                    .OffsetToPosition(CodeEditorController.FindWordStart(this.TextEditor.Document, moff));
                this.TextEditor.SelectionManager.SetSelection(min, max);
            } else {
                let moff = this.TextEditor.Document.PositionToOffset(realMousePos);
                max = this.TextEditor.Document
                    .OffsetToPosition(CodeEditorController.FindWordEnd(this.TextEditor.Document, moff));
                this.TextEditor.SelectionManager.SetSelection(min, max);
            }
        } else {
            this.TextEditor.SelectionManager
                .ExtendSelection(oldPos, this.TextEditor.Caret.Position);
        }
        //textArea.SetDesiredColumn();
    }


    private _OnDocumentChanged(e: CodeEditor.DocumentEventArgs) {
        //TODO: 进一步合并LineManager改变的行数
        let dirtyLines = this.Document.SyntaxParser.GetDirtyLines(this);
        // @ts-ignore
        this.RequestInvalidate?.call(this, true, dirtyLines);
    }

    private _OnCaretPositionChanged() {
        //TODO: set IME input rect

        // @ts-ignore
        this.RequestInvalidate?.call(this, false, null);
    }


    private static IsSelectableChar(c: any): boolean {
        return !CodeEditorController.IsWhiteSpace(c);
    }

    private static IsWhiteSpace(c: any): boolean {
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
