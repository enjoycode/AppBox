import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class TextEditor {
    public constructor(controller: CodeEditor.CodeEditorController) {
        this.Controller = controller;
        this.Controller.Document.UndoStack.TextEditor = this;

        this.Caret = new CodeEditor.Caret(this);
        this.SelectionManager = new CodeEditor.SelectionManager(this);

        this.TextView = new CodeEditor.TextView(this);
        this.LeftAreas = [new CodeEditor.GutterArea(this), new CodeEditor.FoldArea(this)];

        //TODO: Caret position changed to matching bracket
    }

    public readonly Controller: CodeEditor.CodeEditorController;
    public readonly Caret: CodeEditor.Caret;
    public readonly SelectionManager: CodeEditor.SelectionManager;

    public get Theme(): CodeEditor.TextEditorTheme {
        return this.Controller.Theme;
    }

    public get Document(): CodeEditor.Document {
        return this.Controller.Document;
    }

    public readonly TextView: CodeEditor.TextView;
    public readonly LeftAreas: CodeEditor.EditorArea[];

    private _virtualTop: PixUI.Point = (PixUI.Point.Empty).Clone();

    public get VirtualTop(): PixUI.Point {
        return this._virtualTop;
    }

    public set VirtualTop(value: PixUI.Point) {
        let newVirtualTop = new PixUI.Point(Math.max(0, value.X),
            Math.min(this.MaxVScrollValue, Math.max(0, value.Y)));
        if (System.OpInequality(this._virtualTop, newVirtualTop))
            this._virtualTop = (newVirtualTop).Clone();

        //TODO: updateCaretPosition
    }

    public get MaxVScrollValue(): number {
        return (this.Document.GetVisibleLine(this.Document.TotalNumberOfLines - 1) + 1 +
            this.TextView.VisibleLineCount * 2 / 3) * this.TextView.FontHeight;
    }

    public PointerPos: PixUI.Point = (PixUI.Point.Empty).Clone(); //缓存位置


    public InsertOrReplaceString(text: string, replaceOffset: number = 0) {
        this.Document.UndoStack.StartUndoGroup();

        if (this.Document.TextEditorOptions.DocumentSelectionMode == CodeEditor.DocumentSelectionMode.Normal &&
            this.SelectionManager.HasSomethingSelected) {
            this.Caret.Position = (this.SelectionManager.SelectionCollection[0].StartPosition).Clone();
            this.SelectionManager.RemoveSelectedText();
        }

        let caretLine = this.Document.GetLineSegment(this.Caret.Line);
        if (caretLine.Length < this.Caret.Column) {
            let whiteSpaceLength = this.Caret.Column - caretLine.Length;
            text = ' '.repeat(whiteSpaceLength) + text;
        }

        if (replaceOffset == 0) {
            this.Document.Insert(this.Caret.Offset, text);
            this.Caret.Position = this.Document.OffsetToPosition(this.Caret.Offset + text.length);
        } else {
            this.Document.Replace(this.Caret.Offset - replaceOffset, replaceOffset, text);
            if (replaceOffset == text.length) {
                this.Caret.UpdateCaretPosition(); //替换后位置没有变化，需要更新光标的绘制坐标
            } else {
                this.Caret.Position = new CodeEditor.TextLocation(this.Caret.Position.Column - replaceOffset + text.length,
                    this.Caret.Position.Line);
            }
        }

        this.Document.UndoStack.EndUndoGroup();
    }

    public DeleteSelection() {
        if (this.SelectionManager.SelectionIsReadonly) return;

        this.Caret.Position = (this.SelectionManager.SelectionCollection[0].StartPosition).Clone();
        this.SelectionManager.RemoveSelectedText();
        //textArea.scrollToCaret();
    }

    public Paint(canvas: PixUI.Canvas, size: PixUI.Size, dirtyArea: Nullable<PixUI.IDirtyArea>) {
        //TODO: check dirtyArea
        let currentXPos = 0;
        let currentYPos = 0;
        //var adjustScrollBars = false;

        // paint left areas
        for (const area of this.LeftAreas) {
            if (!area.IsVisible) continue;

            let areaRect = PixUI.Rect.FromLTWH(currentXPos, currentYPos, area.Size.Width,
                size.Height - currentYPos);
            if (System.OpInequality(areaRect, area.Bounds)) {
                //adjustScrollBars = true;
                area.Bounds = (areaRect).Clone();
            }

            currentXPos += area.Bounds.Width;
            area.Paint(canvas, (areaRect).Clone());
        }

        // paint text area
        let textRect = PixUI.Rect.FromLTWH(currentXPos, currentYPos,
            size.Width - currentXPos, size.Height - currentYPos);
        if (System.OpInequality(textRect, this.TextView.Bounds)) {
            //adjustScrollBars = true;
            this.TextView.Bounds = (textRect).Clone();
            //TODO: updateCaretPosition
        }

        this.TextView.Paint(canvas, (textRect).Clone());
    }
}
