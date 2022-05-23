export interface IUndoableOperation {
    Undo(): void;

    Redo(): void;
}
