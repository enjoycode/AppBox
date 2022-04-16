import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class TSEdit {
    public startIndex: number = 0;
    public oldEndIndex: number = 0;
    public newEndIndex: number = 0;
    public startPosition: CodeEditor.TSPoint = CodeEditor.TSPoint.Empty;
    public oldEndPosition: CodeEditor.TSPoint = CodeEditor.TSPoint.Empty;
    public newEndPosition: CodeEditor.TSPoint = CodeEditor.TSPoint.Empty;
}
