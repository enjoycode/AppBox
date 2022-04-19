import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class UndoStack {
    private readonly _undostack: System.Stack<CodeEditor.IUndoableOperation> = new System.Stack<CodeEditor.IUndoableOperation>();
    private readonly _redostack: System.Stack<CodeEditor.IUndoableOperation> = new System.Stack<CodeEditor.IUndoableOperation>();

    public TextEditor: Nullable<CodeEditor.TextEditor>;

    private _undoGroupDepth: number = 0;
    private _actionCountInUndoGroup: number = 0;

    public AcceptChanges: boolean = true;

    public get CanUndo(): boolean {
        return this._undostack.length > 0;
    }

    public get CanRedo(): boolean {
        return this._redostack.length > 0;
    }

    public get UndoItemCount(): number {
        return this._undostack.length;
    }

    public get RedoItemCount(): number {
        return this._redostack.length;
    }

    public StartUndoGroup() {
        if (this._undoGroupDepth == 0) {
            this._actionCountInUndoGroup = 0;
        }

        this._undoGroupDepth++;
        //Util.LoggingService.Debug("Open undo group (new depth=" + undoGroupDepth + ")");
    }

    public EndUndoGroup() {
        if (this._undoGroupDepth == 0)
            throw new System.InvalidOperationException("There are no open undo groups");
        this._undoGroupDepth--;
        //Util.LoggingService.Debug("Close undo group (new depth=" + undoGroupDepth + ")");
        if (this._undoGroupDepth == 0 && this._actionCountInUndoGroup > 1) {
            let op = new CodeEditor.UndoQueue(this._undostack, this._actionCountInUndoGroup);
            this._undostack.Push(op);
            //OperationPushed?.Invoke(this, new OperationEventArgs(op));
        }
    }

    public AssertNoUndoGroupOpen() {
        if (this._undoGroupDepth != 0) {
            this._undoGroupDepth = 0;
            throw new System.InvalidOperationException("No undo group should be open at this point");
        }
    }

    public Undo() {
        this.AssertNoUndoGroupOpen();
        if (this._undostack.length > 0) {
            let uedit = this._undostack.Pop();
            this._redostack.Push(uedit);
            uedit.Undo();
            // OnActionUndone();
        }
    }

    public Redo() {
        this.AssertNoUndoGroupOpen();
        if (this._redostack.length > 0) {
            let uedit = this._redostack.Pop();
            this._undostack.Push(uedit);
            uedit.Redo();
            // OnActionRedone();
        }
    }

    public Push(operation: CodeEditor.IUndoableOperation) {
        if (operation == null)
            throw new System.ArgumentNullException("operation");

        if (this.AcceptChanges) {
            this.StartUndoGroup();
            this._undostack.Push(operation);
            this._actionCountInUndoGroup++;
            if (this.TextEditor != null) {
                this._undostack.Push(new CodeEditor.UndoableSetCaretPosition(this, (this.TextEditor.Caret.Position).Clone()));
                this._actionCountInUndoGroup++;
            }

            this.EndUndoGroup();
            this.ClearRedoStack();
        }
    }

    public ClearRedoStack() {
        this._redostack.Clear();
    }

    public ClearAll() {
        this.AssertNoUndoGroupOpen();
        this._undostack.Clear();
        this._redostack.Clear();
        this._actionCountInUndoGroup = 0;
    }

    public Init(props: Partial<UndoStack>): UndoStack {
        Object.assign(this, props);
        return this;
    }
}
