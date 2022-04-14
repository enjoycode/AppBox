import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class UndoableReplace implements CodeEditor.IUndoableOperation {
    public constructor(document: CodeEditor.Document, offset: number, origText: string, text: string) {
        this._document = document;
        this._offset = offset;
        this._text = text;
        this._origText = origText;
    }

    private readonly _document: CodeEditor.Document;
    private readonly _offset: number;
    private readonly _text: string;
    private readonly _origText: string;

    public Undo() {
        this._document.UndoStack.TextEditor?.SelectionManager.ClearSelection();

        this._document.UndoStack.AcceptChanges = false;
        this._document.Replace(this._offset, this._text.length, this._origText);
        this._document.UndoStack.AcceptChanges = true;
    }

    public Redo() {
        this._document.UndoStack.TextEditor?.SelectionManager.ClearSelection();

        this._document.UndoStack.AcceptChanges = false;
        this._document.Replace(this._offset, this._origText.length, this._text);
        this._document.UndoStack.AcceptChanges = true;
    }

    public Init(props: Partial<UndoableReplace>): UndoableReplace {
        Object.assign(this, props);
        return this;
    }
}
