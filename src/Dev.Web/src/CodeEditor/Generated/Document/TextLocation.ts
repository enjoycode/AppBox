import * as System from '@/System'

export class TextLocation implements System.IComparable<TextLocation>, System.IEquatable<TextLocation> {
    private static readonly $meta_System_IComparable = true;
    private static readonly $meta_System_IEquatable = true;
    public static readonly MaxColumn: number = 0xFFFFFF; //int.MaxValue;

    public static readonly Empty: TextLocation = new TextLocation(-1, -1);

    public constructor(column: number, line: number) {
        this.Line = line;
        this.Column = column;
    }

    public Line: number = 0;
    public Column: number = 0;

    public get IsEmpty(): boolean {
        return this.Column <= 0 && this.Line <= 0;
    }

    public toString(): string {
        return `(Line ${this.Line}, Col ${this.Column})`;
    }

    public Equals(other: TextLocation): boolean {
        return System.OpEquality(this, other);
    }

    public static op_Equality(a: TextLocation, b: TextLocation): boolean {
        return a.Column == b.Column && a.Line == b.Line;
    }

    public static op_Inequality(a: TextLocation, b: TextLocation): boolean {
        return a.Column != b.Column || a.Line != b.Line;
    }

    public static op_LessThan(a: TextLocation, b: TextLocation): boolean {
        if (a.Line < b.Line)
            return true;
        if (a.Line == b.Line)
            return a.Column < b.Column;
        return false;
    }

    public static op_GreaterThan(a: TextLocation, b: TextLocation): boolean {
        if (a.Line > b.Line)
            return true;
        if (a.Line == b.Line)
            return a.Column > b.Column;
        return false;
    }

    // public static bool operator <=(TextLocation a, TextLocation b)
    // {
    //     return !(a > b);
    // }
    //
    // public static bool operator >=(TextLocation a, TextLocation b)
    // {
    //     return !(a < b);
    // }

    public Clone(): TextLocation {
        return new TextLocation(this.Column, this.Line);
    }

    public CompareTo(other: TextLocation): number {
        if (System.OpEquality(this, other))
            return 0;
        if (TextLocation.op_LessThan(this, other))
            return -1;
        return 1;
    }
}
