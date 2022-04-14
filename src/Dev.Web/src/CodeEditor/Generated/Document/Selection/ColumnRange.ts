import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class ColumnRange implements System.IEquatable<ColumnRange> {
    public constructor(startColumn: number, endColumn: number) {
        this.StartColumn = startColumn;
        this.EndColumn = endColumn;
    }

    public readonly StartColumn: number;
    public readonly EndColumn: number;

    public Equals(other: ColumnRange): boolean {
        return this.StartColumn == other.StartColumn && this.EndColumn == other.EndColumn;
    }
}
