import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class Document implements System.IDisposable {
    public constructor(fileName: string) {
        this._fileName = fileName;
        this.TextBuffer = new CodeEditor.ImmutableTextBuffer();
        this._lineManager = new CodeEditor.LineManager(this);
        this.SyntaxParser = new CodeEditor.SyntaxParser(this);
        this.FoldingManager = new CodeEditor.FoldingManager(this);
        this.TextEditorOptions = new CodeEditor.TextEditorOptions();
        this.UndoStack = new CodeEditor.UndoStack();
    }


    private _fileName: string = "";
    private readonly _lineManager: CodeEditor.LineManager;
    public readonly TextBuffer: CodeEditor.ITextBuffer;
    public readonly SyntaxParser: CodeEditor.SyntaxParser;
    public readonly FoldingManager: CodeEditor.FoldingManager;
    public readonly TextEditorOptions: CodeEditor.TextEditorOptions;
    public readonly UndoStack: CodeEditor.UndoStack;

    public Readonly: boolean = false;

    public get TextLength(): number {
        return this.TextBuffer.Length;
    }

    public get TotalNumberOfLines(): number {
        return this._lineManager.TotalNumberOfLines;
    }


    public readonly DocumentChanged = new System.Event<CodeEditor.DocumentEventArgs>();


    public get TextContent(): string {
        return this.GetText(0, this.TextBuffer.Length);
    }

    public set TextContent(value: string) {
        this.TextBuffer.SetContent(value);
        this._lineManager.SetContent(value);
        this.UndoStack.ClearAll();
        this.SyntaxParser.Parse(true);
        this.SyntaxParser.Tokenize(0, this.TotalNumberOfLines);

        this.DocumentChanged.Invoke(new CodeEditor.DocumentEventArgs(this, 0, 0, value));
    }

    public GetCharAt(offset: number): any {
        return this.TextBuffer.GetCharAt(offset);
    }

    public GetText(offset: number, length: number): string {
        return this.TextBuffer.GetText(offset, length);
    }

    public Insert(offset: number, text: string) {
        if (this.Readonly) return;

        this.SyntaxParser.BeginInsert(offset, text.length);

        this.TextBuffer.Insert(offset, text);
        this._lineManager.Insert(offset, text);
        this.UndoStack.Push(new CodeEditor.UndoableInsert(this, offset, text));

        this.SyntaxParser.EndInsert(offset, text.length);

        this.DocumentChanged.Invoke(new CodeEditor.DocumentEventArgs(this, offset, 0, text));
    }

    public Remove(offset: number, length: number) {
        if (this.Readonly) return;

        this.SyntaxParser.BeginRemove(offset, length);

        this.UndoStack.Push(new CodeEditor.UndoableDelete(this, offset, this.GetText(offset, length)));
        this.TextBuffer.Remove(offset, length);
        this._lineManager.Remove(offset, length);

        this.SyntaxParser.EndRemove();

        this.DocumentChanged.Invoke(new CodeEditor.DocumentEventArgs(this, offset, length, ""));
    }

    public Replace(offset: number, length: number, text: string) {
        if (this.Readonly) return;

        this.SyntaxParser.BeginReplace(offset, length, text.length);

        this.UndoStack.Push(new CodeEditor.UndoableReplace(this, offset, this.GetText(offset, length), text));
        this.TextBuffer.Replace(offset, length, text);
        this._lineManager.Replace(offset, length, text);

        this.SyntaxParser.EndReplace(offset, length, text.length);

        this.DocumentChanged.Invoke(new CodeEditor.DocumentEventArgs(this, offset, length, text));
    }


    public GetLineNumberForOffset(offset: number): number {
        return this._lineManager.GetLineNumberForOffset(offset);
    }

    public GetLineSegmentForOffset(offset: number): CodeEditor.LineSegment {
        return this._lineManager.GetLineSegmentForOffset(offset);
    }

    public GetLineSegment(lineNumber: number): CodeEditor.LineSegment {
        return this._lineManager.GetLineSegment(lineNumber);
    }

    public GetFirstLogicalLine(lineNumber: number): number {
        return this._lineManager.GetFirstLogicalLine(lineNumber);
    }

    public GetVisibleLine(lineNumber: number): number {
        return this._lineManager.GetVisibleLine(lineNumber);
    }

    public OffsetToPosition(offset: number): CodeEditor.TextLocation {
        let lineNumber = this.GetLineNumberForOffset(offset);
        let line = this.GetLineSegment(lineNumber);
        return new CodeEditor.TextLocation(offset - line.Offset, lineNumber);
    }

    public PositionToOffset(position: CodeEditor.TextLocation): number {
        if (position.Line >= this.TotalNumberOfLines) return 0;

        let line = this.GetLineSegment(position.Line);
        return Math.min(this.TextLength, line.Offset + Math.min(line.Length, position.Column));
    }

    public UpdateSegmentsOnDocumentChanged<T extends CodeEditor.ISegment>(list: System.IList<T>, e: CodeEditor.DocumentEventArgs) {
        let removedCharacters = e.Length > 0 ? e.Length : 0;
        let insertedCharacters = System.IsNullOrEmpty(e.Text) ? 0 : e.Text.length;
        for (let i = 0; i < list.length; ++i) {
            let s: CodeEditor.ISegment = list[i];
            let segmentStart = s.Offset;
            let segmentEnd = s.Offset + s.Length;

            if (e.Offset <= segmentStart) {
                segmentStart -= removedCharacters;
                if (segmentStart < e.Offset) segmentStart = e.Offset;
            }

            if (e.Offset < segmentEnd) {
                segmentEnd -= removedCharacters;
                if (segmentEnd < e.Offset) segmentEnd = e.Offset;
            }

            // Debug.Assert(segmentStart <= segmentEnd);

            if (segmentStart == segmentEnd) {
                list.RemoveAt(i);
                --i;
                continue;
            }

            if (e.Offset <= segmentStart) segmentStart += insertedCharacters;
            if (e.Offset < segmentEnd) segmentEnd += insertedCharacters;

            // Debug.Assert(segmentStart < segmentEnd);

            s.Offset = segmentStart;
            s.Length = segmentEnd - segmentStart;
        }
    }


    public Dispose() {
        this.SyntaxParser.Dispose();
    }

    public Init(props: Partial<Document>): Document {
        Object.assign(this, props);
        return this;
    }
}
