import * as CodeEditor from '@/CodeEditor'

export class TSEdit {
    public startIndex: number = 0;
    public oldEndIndex: number = 0;
    public newEndIndex: number = 0;
    public startPosition: CodeEditor.TSPoint = CodeEditor.TSPoint.Empty;
    public oldEndPosition: CodeEditor.TSPoint = CodeEditor.TSPoint.Empty;
    public newEndPosition: CodeEditor.TSPoint = CodeEditor.TSPoint.Empty;

    public Clone(): TSEdit {
        let clone = new TSEdit();
        clone.startIndex = this.startIndex;
        clone.oldEndIndex = this.oldEndIndex;
        clone.newEndIndex = this.newEndIndex;
        clone.startPosition = this.startPosition;
        clone.oldEndPosition = this.oldEndPosition;
        clone.newEndPosition = this.newEndPosition;
        return clone;
    }
}
