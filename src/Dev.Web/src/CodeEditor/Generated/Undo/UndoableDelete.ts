import * as CodeEditor from '@/CodeEditor'

export class UndoableDelete implements CodeEditor.IUndoableOperation {
    public constructor(document: CodeEditor.Document, offset: number, text: string) {
        this._document = document;
        this._offset = offset;
        this._text = text;
    }

    private readonly _document: CodeEditor.Document;
    private readonly _offset: number;
    private readonly _text: string;

    public Undo() {
        this._document.UndoStack.TextEditor?.SelectionManager.ClearSelection();

        this._document.UndoStack.AcceptChanges = false;
        this._document.Insert(this._offset, this._text);
        this._document.UndoStack.AcceptChanges = true;
    }

    public Redo() {
        this._document.UndoStack.TextEditor?.SelectionManager.ClearSelection();

        this._document.UndoStack.AcceptChanges = false;
        this._document.Remove(this._offset, this._text.length);
        this._document.UndoStack.AcceptChanges = true;
    }
}
