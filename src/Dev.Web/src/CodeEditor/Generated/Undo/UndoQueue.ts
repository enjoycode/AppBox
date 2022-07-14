import * as System from '@/System'
import * as CodeEditor from '@/CodeEditor'

export class UndoQueue implements CodeEditor.IUndoableOperation {
    public constructor(stack: System.Stack<CodeEditor.IUndoableOperation>, numops: number) {
        numops = Math.min(numops, stack.length);
        this._undoList = new Array<CodeEditor.IUndoableOperation>(numops);
        for (let i = 0; i < numops; ++i) {
            this._undoList[i] = stack.Pop();
        }
    }

    private readonly _undoList: CodeEditor.IUndoableOperation[];

    public Undo() {
        for (let i = 0; i < this._undoList.length; ++i) {
            this._undoList[i].Undo();
        }
    }

    public Redo() {
        for (let i = this._undoList.length - 1; i >= 0; --i) {
            this._undoList[i].Redo();
        }
    }

    public Init(props: Partial<UndoQueue>): UndoQueue {
        Object.assign(this, props);
        return this;
    }
}
