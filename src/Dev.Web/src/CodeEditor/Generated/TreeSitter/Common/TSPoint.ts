import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class TSPoint {
    public static readonly Empty: TSPoint = new TSPoint(0, 0);

    public readonly row: number;

    public readonly column: number;

    public constructor(row: number, column: number) {
        this.row = <number><any>row;
        this.column = <number><any>column;
    }

    public static FromLocation(location: CodeEditor.TextLocation): TSPoint {
        return new TSPoint(location.Line, location.Column * 2);
    }

    public toString(): string {
        return `(${this.row}, ${this.column})`;
    }
}
