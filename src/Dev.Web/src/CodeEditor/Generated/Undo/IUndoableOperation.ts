import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export interface IUndoableOperation {
    Undo(): void;

    Redo(): void;
}
