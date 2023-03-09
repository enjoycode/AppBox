import * as System from '@/System'

export class EdgeInsets implements System.IEquatable<EdgeInsets> {
    private static readonly $meta_System_IEquatable = true;
    public readonly Left: number;
    public readonly Top: number;
    public readonly Right: number;
    public readonly Bottom: number;

    public get Horizontal(): number {
        return this.Left + this.Right;
    }

    public get Vertical(): number {
        return this.Top + this.Bottom;
    }

    private constructor(left: number, top: number, right: number, bottom: number) {
        this.Left = Math.max(0, left);
        this.Top = Math.max(0, top);
        this.Right = Math.max(0, right);
        this.Bottom = Math.max(0, bottom);
    }

    public static All(value: number): EdgeInsets {
        return new EdgeInsets(value, value, value, value);
    }

    public static Only(left: number, top: number, right: number, bottom: number): EdgeInsets {
        return new EdgeInsets(left, top, right, bottom);
    }

    public Clone(): EdgeInsets {
        return new EdgeInsets(this.Left, this.Top, this.Right, this.Bottom);
    }

    public static op_Equality(left: EdgeInsets, right: EdgeInsets): boolean {
        return left.Equals(right);
    }

    public static op_Inequality(left: EdgeInsets, right: EdgeInsets): boolean {
        return !left.Equals(right);
    }

    public Equals(other: EdgeInsets): boolean {
        return this.Left == other.Left && this.Top == other.Top &&
            this.Right == other.Right && this.Bottom == other.Bottom;
    }

}
