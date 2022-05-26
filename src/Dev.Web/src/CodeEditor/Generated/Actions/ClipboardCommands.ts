import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class CutCommand implements CodeEditor.IEditCommand {
    public Execute(editor: CodeEditor.TextEditor) {
        let selectedText = editor.SelectionManager.SelectedText;
        if (selectedText.length > 0) {
            PixUI.Clipboard.WriteText(selectedText);
            editor.Caret.Position =
                (editor.SelectionManager.SelectionCollection[0].StartPosition).Clone();
            editor.SelectionManager.RemoveSelectedText();
        }
    }

    public Init(props: Partial<CutCommand>): CutCommand {
        Object.assign(this, props);
        return this;
    }
}

export class CopyCommand implements CodeEditor.IEditCommand {
    public Execute(editor: CodeEditor.TextEditor) {
        let selectedText = editor.SelectionManager.SelectedText;
        if (selectedText.length > 0)
            PixUI.Clipboard.WriteText(selectedText);
    }

    public Init(props: Partial<CopyCommand>): CopyCommand {
        Object.assign(this, props);
        return this;
    }
}

export class PasteCommand implements CodeEditor.IEditCommand {
    public Execute(editor: CodeEditor.TextEditor) {
        //TODO: return when readonly
        PasteCommand.ExecInternal(editor);
    }

    private static async ExecInternal(editor: CodeEditor.TextEditor): System.ValueTask {
        let text = await PixUI.Clipboard.ReadText();
        if (System.IsNullOrEmpty(text)) return;

        editor.Document.UndoStack.StartUndoGroup();
        if (editor.SelectionManager.HasSomethingSelected) {
            editor.Caret.Position =
                (editor.SelectionManager.SelectionCollection[0].StartPosition).Clone();
            editor.SelectionManager.RemoveSelectedText();
        }

        editor.InsertOrReplaceString(text);
        editor.Document.UndoStack.EndUndoGroup();
    }

    public Init(props: Partial<PasteCommand>): PasteCommand {
        Object.assign(this, props);
        return this;
    }
}
