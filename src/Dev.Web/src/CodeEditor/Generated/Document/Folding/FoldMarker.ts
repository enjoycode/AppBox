import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export enum FoldType {
    Unspecified,
    MemberBody,
    Region,
    TypeBody
}

export class FoldMarker implements CodeEditor.ISegment, System.IComparable<FoldMarker> {
    public constructor(document: CodeEditor.Document, startLine: number, startColumn: number, endLine: number, endColumn: number, foldType: FoldType, foldText: Nullable<string> = null, isFolded: boolean = false) {
        this._document = document;
        this.IsFolded = isFolded;
        this._foldType = foldType;
        this.FoldText = System.IsNullOrEmpty(foldText) ? "..." : foldText;

        startLine = Math.min(this._document.TotalNumberOfLines - 1, Math.max(startLine, 0));
        let startLineSegment = this._document.GetLineSegment(startLine);

        endLine = Math.min(document.TotalNumberOfLines - 1, Math.max(endLine, 0));
        let endLineSegment = this._document.GetLineSegment(endLine);

        this._offset = startLineSegment.Offset + Math.min(startColumn, startLineSegment.Length);
        this._length = endLineSegment.Offset + Math.min(endColumn, endLineSegment.Length) - this._offset;
    }

    private readonly _document: CodeEditor.Document;
    public IsFolded: boolean = false;
    private _foldType: FoldType = 0;
    #FoldText: string = "";
    public get FoldText() {
        return this.#FoldText;
    }

    private set FoldText(value) {
        this.#FoldText = value;
    }

    private _startLine: number = -1;
    private _startColumn: number = 0;
    private _endLine: number = -1;
    private _endColumn: number = 0;

    private _offset: number = 0;
    private _length: number = 0;

    public get Offset(): number {
        return this._offset;
    }

    public set Offset(value: number) {
        this._offset = value;
        this._startLine = this._endLine = -1;
    }

    public get Length(): number {
        return this._length;
    }

    public set Length(value: number) {
        this._length = value;
        this._endLine = -1;
    }

    public get StartLine(): number {
        if (this._startLine < 0) this.GetStartPointForOffset(this.Offset);
        return this._startLine;
    }

    public get StartColumn(): number {
        if (this._startLine < 0) this.GetStartPointForOffset(this.Offset);
        return this._startColumn;
    }

    public get EndLine(): number {
        if (this._endLine < 0) this.GetEndPointForOffset(this.Offset + this.Length);
        return this._endLine;
    }

    public get EndColumn(): number {
        if (this._endLine < 0) this.GetEndPointForOffset(this.Offset + this.Length);
        return this._endColumn;
    }

    private GetStartPointForOffset(offset: number) {
        if (offset > this._document.TextLength) {
            this._startLine = this._document.TotalNumberOfLines + 1;
            this._startColumn = 1;
        } else if (offset < 0) {
            this._startLine = this._startColumn = -1;
        } else {
            this._startLine = this._document.GetLineNumberForOffset(offset);
            this._startColumn = offset - this._document.GetLineSegment(this._startLine).Offset;
        }
    }

    private GetEndPointForOffset(offset: number) {
        if (offset > this._document.TextLength) {
            this._endLine = this._document.TotalNumberOfLines + 1;
            this._endColumn = 1;
        } else if (offset < 0) {
            this._endLine = this._endColumn = -1;
        } else {
            this._endLine = this._document.GetLineNumberForOffset(offset);
            this._endColumn = offset - this._document.GetLineSegment(this._endLine).Offset;
        }
    }

    public CompareTo(other: FoldMarker): number {
        return this.Offset != other.Offset
            ? this.Offset.CompareTo(other.Offset)
            : this.Length.CompareTo(other.Length);
    }

    public Init(props: Partial<FoldMarker>): FoldMarker {
        Object.assign(this, props);
        return this;
    }
}
