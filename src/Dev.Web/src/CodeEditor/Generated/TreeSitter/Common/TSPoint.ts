import * as CodeEditor from '@/CodeEditor'

export class TSPoint {
    public static readonly Empty: TSPoint = new TSPoint(0, 0);

    public readonly row: number;

    public readonly column: number;

    public constructor(row: number, column: number) {
        this.row = (Math.floor(row) & 0xFFFFFFFF);
        this.column = (Math.floor(column) & 0xFFFFFFFF);
    }

    public Clone(): TSPoint {
        return new TSPoint((Math.floor(this.row) & 0xFFFFFFFF), (Math.floor(this.column) & 0xFFFFFFFF));
    }

    public static FromLocation(location: CodeEditor.TextLocation): TSPoint {
        return new TSPoint(location.Line, location.Column * CodeEditor.SyntaxParser.ParserEncoding);
    }

    toString(): string {
        return `(${this.row}, ${this.column})`;
    }
}
