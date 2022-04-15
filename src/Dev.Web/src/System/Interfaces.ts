export interface IDisposable {
    Dispose(): void;
}

export interface IEquatable<T> {
    Equals(other: T): boolean;
}

export interface IComparable<T> {
    CompareTo(other: T): number;
}

export interface IComparer<T> {
    Compare(a: T, b: T): number;
}