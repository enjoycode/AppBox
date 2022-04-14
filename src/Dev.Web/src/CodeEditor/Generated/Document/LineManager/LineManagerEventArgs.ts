import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class LineCountChangeEventArgs {
    public constructor(document: CodeEditor.Document, start: number, moved: number) {
        this.Document = document;
        this.Start = start;
        this.Moved = moved;
    }

    public readonly Document: CodeEditor.Document;

    public readonly Start: number;

    public readonly Moved: number;
}

export class LineEventArgs {
    public constructor(document: CodeEditor.Document, lineSegment: CodeEditor.LineSegment) {
        this.Document = document;
        this.LineSegment = lineSegment;
    }

    public readonly Document: CodeEditor.Document;
    public readonly LineSegment: CodeEditor.LineSegment;
}

export class LineLengthChangeEventArgs {
    public constructor(document: CodeEditor.Document, lineSegment: CodeEditor.LineSegment, lengthDelta: number) {
        this.Document = document;
        this.LineSegment = lineSegment;
        this.LengthDelta = lengthDelta;
    }

    public readonly Document: CodeEditor.Document;
    public readonly LineSegment: CodeEditor.LineSegment;
    public readonly LengthDelta: number;
}
