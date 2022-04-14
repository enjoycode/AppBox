import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class UndoableSetCaretPosition implements CodeEditor.IUndoableOperation {
    public constructor(stack: CodeEditor.UndoStack, pos: CodeEditor.TextLocation) {
        this._stack = stack;
        this._pos = pos;
    }

    private readonly _stack: CodeEditor.UndoStack;
    private readonly _pos: CodeEditor.TextLocation;
    private _redoPos: CodeEditor.TextLocation = CodeEditor.TextLocation.Empty;

    public Undo() {
        this._redoPos = this._stack.TextEditor!.Caret.Position;
        this._stack.TextEditor!.Caret.Position = this._pos;
        this._stack.TextEditor!.SelectionManager.ClearSelection();
    }

    public Redo() {
        this._stack.TextEditor!.Caret.Position = this._redoPos;
        this._stack.TextEditor!.SelectionManager.ClearSelection();
    }

    public Init(props: Partial<UndoableSetCaretPosition>): UndoableSetCaretPosition {
        Object.assign(this, props);
        return this;
    }
}
