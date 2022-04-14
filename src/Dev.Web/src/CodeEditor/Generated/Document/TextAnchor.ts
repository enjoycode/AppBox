import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export enum AnchorMovementType {
    BeforeInsertion,

    AfterInsertion
}

/// <summary>
/// An anchor that can be put into a document and moves around when the document is changed.
/// </summary>
export class TextAnchor {
    private static AnchorDeletedError(): System.Exception {
        return new System.InvalidOperationException("The text containing the anchor was deleted");
    }

    public constructor(lineSegment: CodeEditor.LineSegment, columnNumber: number) {
        this.lineSegment = lineSegment;
        this.columnNumber = columnNumber;
    }

    private lineSegment: CodeEditor.LineSegment;
    private columnNumber: number = 0;

    public get Line(): CodeEditor.LineSegment {
        if (this.lineSegment == null) throw TextAnchor.AnchorDeletedError();
        return this.lineSegment;
    }

    public set Line(value: CodeEditor.LineSegment) {
        this.lineSegment = value;
    }

    public get IsDeleted(): boolean {
        return this.lineSegment == null;
    }

    public get LineNumber(): number {
        return this.Line.LineNumber;
    }

    public get ColumnNumber(): number {
        if (this.lineSegment == null) throw TextAnchor.AnchorDeletedError();
        return this.columnNumber;
    }

    public set ColumnNumber(value: number) {
        this.columnNumber = value;
    }

    public get Location(): CodeEditor.TextLocation {
        return new CodeEditor.TextLocation(this.ColumnNumber, this.LineNumber);
    }

    public get Offset(): number {
        return this.Line.Offset + this.columnNumber;
    }

    public MovementType: AnchorMovementType = 0;

    public readonly Deleted = new System.Event();

    public Delete(deferredEventList: CodeEditor.DeferredEventList) {
        // we cannot fire an event here because this method is called while the LineManager adjusts the
        // lineCollection, so an event handler could see inconsistent state
        this.lineSegment = null;
        deferredEventList.AddDeletedAnchor(this);
    }

    public RaiseDeleted() {
        this.Deleted.Invoke();
    }

    public toString(): string {
        return this.IsDeleted ? "[TextAnchor (deleted)]" : `[TextAnchor ${this.Location}]`;
    }

    public Init(props: Partial<TextAnchor>): TextAnchor {
        Object.assign(this, props);
        return this;
    }
}
