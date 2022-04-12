import {IEnumerable} from "../Linq";

export interface IList<T> extends IEnumerable<T> {

    IndexOf(item: T): number;

    Insert(index: number, item: T): void;

    RemoveAt(index: number): void;

    Remove(item: T): boolean;

    Add(item: T): void;

    Clear(): void;

    get length(): number;

    [n: number]: T;
}
