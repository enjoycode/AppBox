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
}

export class CopyCommand implements CodeEditor.IEditCommand {
    public Execute(editor: CodeEditor.TextEditor) {
        let selectedText = editor.SelectionManager.SelectedText;
        if (selectedText.length > 0)
            PixUI.Clipboard.WriteText(selectedText);
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
}
