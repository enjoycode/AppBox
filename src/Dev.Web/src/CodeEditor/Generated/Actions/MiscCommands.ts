import * as CodeEditor from '@/CodeEditor'

export class BackspaceCommand implements CodeEditor.IEditCommand {
    public Execute(editor: CodeEditor.TextEditor) {
        if (editor.SelectionManager.HasSomethingSelected) {
            editor.DeleteSelection();
            return;
        }

        let caretOffset = editor.Caret.Offset;

        if (caretOffset > 0) {
            let curLineNr = editor.Document.GetLineNumberForOffset(caretOffset);
            let curLineOffset = editor.Document.GetLineSegment(curLineNr).Offset;

            if (curLineOffset == caretOffset) {
                let line = editor.Document.GetLineSegment(curLineNr - 1);
                let lineEndOffset = line.Offset + line.Length;
                let lineLength = line.Length;
                editor.Document.Remove(lineEndOffset, curLineOffset - lineEndOffset);
                editor.Caret.Position = new CodeEditor.TextLocation(lineLength, curLineNr - 1);
            } else {
                //TODO:unicode like emoji
                editor.Document.Remove(caretOffset - 1, 1);
                editor.Caret.Position = editor.Document.OffsetToPosition(caretOffset - 1);
            }
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
        editor.InsertOrReplaceString("\n");

        // var curLine = editor.Caret.Line;
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
