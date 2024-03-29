import * as System from '@/System'
import * as CodeEditor from '@/CodeEditor'

export class Selection {
    public constructor(document: CodeEditor.Document, startPosition: CodeEditor.TextLocation, endPosition: CodeEditor.TextLocation) {
        if (CodeEditor.TextLocation.op_GreaterThan(startPosition, endPosition))
            throw new System.ArgumentOutOfRangeException();

        this.Document = document;
        this.StartPosition = (startPosition).Clone();
        this.EndPosition = (endPosition).Clone();
    }

    public readonly Document: CodeEditor.Document;
    #StartPosition: CodeEditor.TextLocation = CodeEditor.TextLocation.Empty.Clone();
    public get StartPosition() {
        return this.#StartPosition;
    }

    public set StartPosition(value) {
        this.#StartPosition = value;
    }

    #EndPosition: CodeEditor.TextLocation = CodeEditor.TextLocation.Empty.Clone();
    public get EndPosition() {
        return this.#EndPosition;
    }

    public set EndPosition(value) {
        this.#EndPosition = value;
    }

    public get Offset(): number {
        return this.Document.PositionToOffset((this.StartPosition).Clone());
    }

    public get EndOffset(): number {
        return this.Document.PositionToOffset((this.EndPosition).Clone());
    }

    public get Length(): number {
        return this.EndOffset - this.Offset;
    }

    public get IsEmpty(): boolean {
        return System.OpEquality(this.StartPosition, this.EndPosition);
    }

    public get SelectedText(): string {
        return this.Length <= 0 ? "" : this.Document.GetText(this.Offset, this.Length);
    }

    public ContainsOffset(offset: number): boolean {
        return this.Offset <= offset && offset <= this.EndOffset;
    }
}
