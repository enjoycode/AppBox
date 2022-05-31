import * as CodeEditor from '@/CodeEditor'

export class BackspaceCommand implements CodeEditor.IEditCommand {
    public Execute(editor: CodeEditor.TextEditor) {
        if (editor.SelectionManager.HasSomethingSelected) {
            editor.DeleteSelection();
            return;
        }

        let caretOffset = editor.Caret.Offset;
        if (caretOffset <= 0) return;

        let curLineNr = editor.Document.GetLineNumberForOffset(caretOffset);
        let curLine = editor.Document.GetLineSegment(curLineNr);
        let curLineOffset = curLine.Offset;
        if (curLineOffset == caretOffset) {
            let preLine = editor.Document.GetLineSegment(curLineNr - 1);
            let preLineEndOffset = preLine.Offset + preLine.Length;
            editor.Document.Remove(preLineEndOffset, curLineOffset - preLineEndOffset);
            editor.Caret.Position = new CodeEditor.TextLocation(preLine.Length, curLineNr - 1);
        } else {
            //TODO:unicode like emoji
            //先处理AutoClosingPairs
            let ch = editor.Document.GetCharAt(caretOffset - 1);
            let closingPair = editor.Document.SyntaxParser.Language.GetAutoColsingPairs(ch);
            let len = closingPair != null &&
            closingPair == editor.Document.GetCharAt(caretOffset)
                ? 2
                : 1;

            editor.Document.Remove(caretOffset - 1, len);
            editor.Caret.Position = editor.Document.OffsetToPosition(caretOffset - 1);
        }
    }

    public Init(props: Partial<BackspaceCommand>): BackspaceCommand {
        Object.assign(this, props);
        return this;
    }
}

export class TabCommand implements CodeEditor.IEditCommand {
    public Execute(editor: CodeEditor.TextEditor) {
        //TODO: 暂简单实现
        // if (editor.Document.ReadOnly) return;

        let tabIndent = editor.Document.TextEditorOptions.TabIndent;
        let convertToWhitespaces = ' '.repeat(tabIndent);
        editor.InsertOrReplaceString(convertToWhitespaces);
    }

    public Init(props: Partial<TabCommand>): TabCommand {
        Object.assign(this, props);
        return this;
    }
}

export class ReturnCommand implements CodeEditor.IEditCommand {
    public Execute(editor: CodeEditor.TextEditor) {
        // if (editor.Document.ReadOnly) return;

        editor.Document.UndoStack.StartUndoGroup();
        let curLine = editor.Caret.Line;
        let curLineSegment = editor.Document.GetLineSegment(curLine);
        let leadingWhiteSpaces = curLineSegment.GetLeadingWhiteSpaces();
        if (leadingWhiteSpaces == 0)
            editor.InsertOrReplaceString("\n");
        else
            editor.InsertOrReplaceString("\n" + ' '.repeat(leadingWhiteSpaces));

        // editor.Document.FormattingStrategy.FormatLine(
        //     editor, curLine, editor.Caret.Offset, '\n');
        editor.Document.UndoStack.EndUndoGroup();
    }

    public Init(props: Partial<ReturnCommand>): ReturnCommand {
        Object.assign(this, props);
        return this;
    }
}

export class UndoCommand implements CodeEditor.IEditCommand {
    public Execute(editor: CodeEditor.TextEditor) {
        // if (editor.Document.ReadOnly) return;

        editor.Document.UndoStack.Undo();
    }

    public Init(props: Partial<UndoCommand>): UndoCommand {
        Object.assign(this, props);
        return this;
    }
}

export class RedoCommand implements CodeEditor.IEditCommand {
    public Execute(editor: CodeEditor.TextEditor) {
        // if (editor.Document.ReadOnly) return;

        editor.Document.UndoStack.Redo();
    }

    public Init(props: Partial<RedoCommand>): RedoCommand {
        Object.assign(this, props);
        return this;
    }
}
