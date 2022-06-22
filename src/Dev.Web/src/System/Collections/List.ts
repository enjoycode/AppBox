import {ArrayEnumerable, IEnumerable} from "../Linq"
import {IList} from "./IList"
import {Predicate, Comparison} from "../Delegates"
import {IComparer} from "../Interfaces"
import {BinarySearch as bs} from "../Utils";

export class List<T> extends ArrayEnumerable<T> implements IList<T> {

    //TODO:考虑ElementType(PayloadType)标记，用于向服务端序列化时作为范型类型

    constructor();
    constructor(cap: number);
    constructor(array: Array<T> | IEnumerable<T>);
    constructor(arg?: any) {
        super();

        if (arg && typeof arg !== "number") {
            for (let item of arg) {
                this.push(item);
            }
        }
    }

    public Init(from: Array<T> | IEnumerable<T>): List<T> {
        for (const item of from) {
            this.push(item);
        }
        return this;
    }

    public Add(item: T): void {
        this.push(item);
    }

    public AddRange(list: IEnumerable<T>) {
        for (const item of list) {
            this.push(item);
        }
    }

    public Remove(item: T): boolean {
        let index = this.indexOf(item);
        if (index >= 0)
            this.splice(index, 1);
        return index >= 0;
    }

    public RemoveAll(pred: Predicate<T>) {
        for (let i = this.length - 1; i >= 0; i--) {
            if (pred(this[i])) {
                this.splice(i, 1);
            }
        }
    }

    IndexOf(item: T): number {
        return this.indexOf(item);
    }

    Insert(index: number, item: T): void {
        this.splice(index, 0, item);
    }

    RemoveAt(index: number): void {
        this.splice(index, 1);
    }

    RemoveRange(index: number, count: number) {
        this.splice(index, count);
    }

    Clear(): void {
        this.splice(0);
    }

    Find(match: (item: T) => boolean): T | null {
        for (let i = 0; i < this.length; i++) {
            if (match(this[i]))
                return this[i];
        }
        return null;
    }

    public Sort(comparison: Comparison<T>) {
        this.sort(comparison);
    }

    public BinarySearch(item: T, comparer: IComparer<T>): number {
        return bs(this, 0, this.length, item, comparer);
    }
}
