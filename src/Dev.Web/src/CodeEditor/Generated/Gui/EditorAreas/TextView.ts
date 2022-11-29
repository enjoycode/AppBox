import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class TextView extends CodeEditor.EditorArea {
    public constructor(textEditor: CodeEditor.TextEditor) {
        super(textEditor);
        this.FontHeight = textEditor.Theme.FontSize + textEditor.Theme.LineSpace * 2;
    }

    private _spaceWidth: number = 10; //TODO: fix

    #FontHeight: number = 0;
    public get FontHeight() {
        return this.#FontHeight;
    }

    private set FontHeight(value) {
        this.#FontHeight = value;
    } //TODO: rename to LineHeight

    public get VisibleLineCount(): number {
        return 1 + (Math.floor(Math.round(this.Bounds.Height / this.FontHeight)) & 0xFFFFFFFF);
    }

    public get VisibleLineDrawingRemainder(): number {
        return (Math.floor(Math.round(this.TextEditor.VirtualTop.Y % this.FontHeight)) & 0xFFFFFFFF);
    }

    public get FirstVisibleLine(): number {
        return this.Document.GetFirstLogicalLine((Math.floor((this.TextEditor.VirtualTop.Y / this.FontHeight)) & 0xFFFFFFFF));
    }

    public set FirstVisibleLine(value: number) {
        if (this.FirstVisibleLine != value) {
            this.TextEditor.VirtualTop = new PixUI.Point(this.TextEditor.VirtualTop.X,
                this.Document.GetVisibleLine(value) * this.FontHeight);
        }
    }

    public get FirstPhysicalLine(): number {
        return (Math.floor((this.TextEditor.VirtualTop.Y / this.FontHeight)) & 0xFFFFFFFF);
    }

    public GetLogicalPosition(visualPosX: number, visualPosY: number): CodeEditor.TextLocation {
        return this.GetLogicalColumn(this.GetLogicalLine(visualPosY), visualPosX).Location;
    }

    public GetLogicalColumn(lineNumber: number, visualPosX: number): LogicalColumnInfo {
        visualPosX += this.TextEditor.VirtualTop.X;
        if (lineNumber >= this.Document.TotalNumberOfLines) {
            return new LogicalColumnInfo(new CodeEditor.TextLocation((Math.floor((visualPosX / this._spaceWidth)) & 0xFFFFFFFF), lineNumber),
                null);
        }

        if (visualPosX <= 0) {
            return new LogicalColumnInfo(new CodeEditor.TextLocation(0, lineNumber), null);
        }

        let line = this.Document.GetLineSegment(lineNumber);
        let inFoldMarker: Nullable<CodeEditor.FoldMarker> = null;
        let para = line.GetLineParagraph(this.TextEditor);
        let columnInLine = para.getGlyphPositionAtCoordinate(visualPosX, 1).pos;
        let column = columnInLine;
        // if has folded, eg: if (xxx) {...} else {...}
        if (line.CachedFolds != null && column > line.CachedFolds[0].LineStart) {
            for (const fold of line.CachedFolds) {
                if (columnInLine < fold.LineStart) break;
                if (columnInLine >= fold.LineStart && columnInLine < fold.LineEnd) {
                    //in fold, TODO: nearest left or right
                    inFoldMarker = fold.FoldMarker;
                    lineNumber = fold.FoldMarker.EndLine;
                    column = fold.FoldMarker.EndColumn;
                    break;
                } else if (columnInLine >= fold.LineEnd) {
                    lineNumber = fold.FoldMarker.EndLine;
                    column = fold.FoldMarker.EndColumn + (columnInLine - fold.LineEnd);
                }
            }
        }

        return new LogicalColumnInfo(new CodeEditor.TextLocation(column, lineNumber), inFoldMarker);
    }

    public GetLogicalLine(visualPosY: number): number {
        let clickedVisualLine = Math.max(0, (Math.floor(((visualPosY + this.TextEditor.VirtualTop.Y) / this.FontHeight)) & 0xFFFFFFFF));
        return this.Document.GetFirstLogicalLine(clickedVisualLine);
    }

    public GetDrawingXPos(logicalLine: number, logicalColumn: number): number {
        let foldings = this.Document.FoldingManager.GetTopLevelFoldedFoldings();

        // search the folding that's interesting
        let foldedLineNumber = -1;
        for (let i = foldings.length - 1; i >= 0; i--) {
            let f = foldings[i];
            if (foldedLineNumber >= 0) {
                // has found fold in pre iterator
                if (f.EndLine == foldedLineNumber)
                    foldedLineNumber = f.StartLine;
                else
                    break;
            } else if (f.StartLine == logicalLine || f.EndLine == logicalLine) {
                foldedLineNumber = f.StartLine;
            }
        }

        let visualLine = foldedLineNumber < 0
            ? this.Document.GetLineSegment(logicalLine)
            : this.Document.GetLineSegment(foldedLineNumber);
        let drawingPos = visualLine.GetXPos(this.TextEditor, logicalLine, logicalColumn);
        return drawingPos - this.TextEditor.VirtualTop.X;
    }

    public HandlePointerDown(x: number, y: number, buttons: PixUI.PointerButtons) {
        let vx = x - this.Bounds.Left;
        let vy = y - this.Bounds.Top;
        if (buttons == PixUI.PointerButtons.Left) {
            //左键按下清除选择并设置新的光标位置
            let logicalLine = this.GetLogicalLine(vy);
            let logicalColumn = this.GetLogicalColumn(logicalLine, vx);

            //Console.WriteLine($"Click at TextView: {logicalColumn.Location}");

            this.TextEditor.SelectionManager.ClearSelection();
            this.TextEditor.Caret.Position = (logicalColumn.Location).Clone();
        } else if (buttons == PixUI.PointerButtons.Right) {
            //右键按下开始显示ContextMenu
            let contextMenuBuilder = this.TextEditor.Controller.ContextMenuBuilder;
            if (contextMenuBuilder != null) {
                let contextMenus = contextMenuBuilder(this.TextEditor);
                if (contextMenus.length > 0)
                    PixUI.ContextMenu.Show(contextMenus);
            }
        }
    }

    public Paint(canvas: PixUI.Canvas, rect: PixUI.Rect) {
        if (rect.Width <= 0 || rect.Height <= 0) return;

        let horizontalDelta = this.TextEditor.VirtualTop.X;
        if (horizontalDelta > 0) {
            canvas.save();
            canvas.clipRect(this.Bounds, CanvasKit.ClipOp.Intersect, false);
        }

        // paint background
        let paint = PixUI.PaintUtils.Shared(this.Theme.TextBgColor);
        canvas.drawRect(rect, paint);

        // paint lines one by one
        let maxLines = (Math.floor(((this.Bounds.Height + this.VisibleLineDrawingRemainder) / this.FontHeight + 1)) & 0xFFFFFFFF);
        this.PaintLines(canvas, maxLines);

        if (horizontalDelta > 0)
            canvas.restore();
    }

    private PaintLines(canvas: PixUI.Canvas, maxLines: number) {
        let horizontalDelta = this.TextEditor.VirtualTop.X;
        for (let y = 0; y < maxLines; y++) {
            let lineRect = PixUI.Rect.FromLTWH(
                this.Bounds.Left - horizontalDelta,
                this.Bounds.Top + y * this.FontHeight - this.VisibleLineDrawingRemainder,
                this.Bounds.Width + horizontalDelta,
                this.FontHeight);
            //TODO: check lineRect overlaps with dirty area.

            let currentLine = this.Document.GetFirstLogicalLine(
                this.Document.GetVisibleLine(this.FirstVisibleLine) + y);
            if (currentLine >= this.Document.TotalNumberOfLines) return;
            let lineSegment = this.Document.GetLineSegment(currentLine);
            if (lineSegment.Length == 0) continue;

            let lineParagraph = lineSegment.GetLineParagraph(this.TextEditor);
            canvas.drawParagraph(lineParagraph, lineRect.Left, lineRect.Top + this.Theme.LineSpace);
        }
    }
}

export class LogicalColumnInfo {
    public readonly Location: CodeEditor.TextLocation;
    public readonly InFoldMarker: Nullable<CodeEditor.FoldMarker>;

    public constructor(location: CodeEditor.TextLocation, inFoldMarker: Nullable<CodeEditor.FoldMarker>) {
        this.Location = (location).Clone();
        this.InFoldMarker = inFoldMarker;
    }
}
