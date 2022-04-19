import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class CaretLeft implements CodeEditor.IEditCommand {
    public Execute(editor: CodeEditor.TextEditor) {
        let position = (editor.Caret.Position).Clone();
        let foldings = editor.Document.FoldingManager.GetFoldedFoldingsWithEnd(position.Line);
        let justBeforeCaret: Nullable<CodeEditor.FoldMarker> = null;
        for (const fm of foldings) {
            if (fm.EndColumn == position.Column) {
                justBeforeCaret = fm;
                // the first folding found is the folding with the smallest Start position
                break;
            }
        }

        if (justBeforeCaret != null) {
            position.Line = justBeforeCaret.StartLine;
            position.Column = justBeforeCaret.StartColumn;
        } else {
            if (position.Column > 0) {
                position.Column -= 1;
            } else if (position.Line > 0) {
                let lineAbove = editor.Document.GetLineSegment(position.Line - 1);
                position.Column = lineAbove.Length;
                position.Line = position.Line - 1;
            }
        }

        editor.Caret.Position = (position).Clone();
        //textArea.setDesiredColumn();
    }

    public Init(props: Partial<CaretLeft>): CaretLeft {
        Object.assign(this, props);
        return this;
    }
}

export class CaretRight implements CodeEditor.IEditCommand {
    public Execute(editor: CodeEditor.TextEditor) {
        let curLine = editor.Document.GetLineSegment(editor.Caret.Line);
        let position = (editor.Caret.Position).Clone();
        let foldings = editor.Document.FoldingManager.GetFoldedFoldingsWithStart(position.Line);
        let justBehindCaret: Nullable<CodeEditor.FoldMarker> = null;
        for (const fm of foldings) {
            if (fm.StartColumn == position.Column) {
                justBehindCaret = fm;
                break;
            }
        }

        if (justBehindCaret != null) {
            position.Line = justBehindCaret.EndLine;
            position.Column = justBehindCaret.EndColumn;
        } else {
            // no folding is interesting
            if (position.Column < curLine.Length ||
                editor.Document.TextEditorOptions.AllowCaretBeyondEOL) {
                position.Column += 1;
            } else if (position.Column + 1 < editor.Document.TotalNumberOfLines) {
                position.Line += 1;
                position.Column = 0;
            }
        }

        editor.Caret.Position = (position).Clone();
        //textArea.setDesiredColumn();
    }

    public Init(props: Partial<CaretRight>): CaretRight {
        Object.assign(this, props);
        return this;
    }
}

export class CaretUp implements CodeEditor.IEditCommand {
    public Execute(editor: CodeEditor.TextEditor) {
        let position = (editor.Caret.Position).Clone();
        let visualLine = editor.Document.GetVisibleLine(position.Line);
        if (visualLine > 0) {
            //暂用模拟点击位置
            let vx = editor.TextView.GetDrawingXPos(position.Line, position.Column) +
                editor.VirtualTop.X;
            let vy = editor.TextView.Bounds.Top +
                (visualLine - 1) * editor.TextView.FontHeight - editor.VirtualTop.Y;
            let logicalLine = editor.TextView.GetLogicalLine(vy);
            let logicalColumn = editor.TextView.GetLogicalColumn(logicalLine, vx);
            editor.Caret.Position = (logicalColumn.Location).Clone();
        }
    }

    public Init(props: Partial<CaretUp>): CaretUp {
        Object.assign(this, props);
        return this;
    }
}

export class CaretDown implements CodeEditor.IEditCommand {
    public Execute(editor: CodeEditor.TextEditor) {
        let position = (editor.Caret.Position).Clone();
        let visualLine = editor.Document.GetVisibleLine(position.Line);
        if (visualLine < editor.Document.GetVisibleLine(editor.Document.TotalNumberOfLines)) {
            //暂用模拟点击位置
            let vx = editor.TextView.GetDrawingXPos(position.Line, position.Column) +
                editor.VirtualTop.X;
            let vy = editor.TextView.Bounds.Top +
                (visualLine + 1) * editor.TextView.FontHeight -
                editor.VirtualTop.Y;
            let logicalLine = editor.TextView.GetLogicalLine(vy);
            let logicalColumn = editor.TextView.GetLogicalColumn(logicalLine, vx);
            editor.Caret.Position = (logicalColumn.Location).Clone();
        }
    }

    public Init(props: Partial<CaretDown>): CaretDown {
        Object.assign(this, props);
        return this;
    }
}
