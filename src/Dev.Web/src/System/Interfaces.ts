import {IEnumerable, isEnumerable} from "@/System/Linq";
import {Event} from "@/System/Event";
import {IList} from "@/System/Collections/IList";

export interface IDisposable {
    Dispose(): void;
}

export function IsInterfaceOfIDisposable(obj: any): obj is IDisposable {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_System_IDisposable' in obj.constructor;
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

//region ====IEnumerator====
export interface IEnumerator<T = any> {
    get Current(): T;

    MoveNext(): boolean;

    Dispose(): void;
}

export class DefaultEnumerator<T> implements IEnumerator<T> {
    public constructor(from: Iterable<T>) {
        this._it = from[Symbol.iterator]();
    }

    private readonly _it: Iterator<T>;
    private _current: T;

    public get Current(): T {
        return this._current;
    }

    public MoveNext(): boolean {
        let res = this._it.next();
        this._current = res.value;
        return res.done === false;
    }

    public Dispose() {
    }
}

// export class Enumerable {
//     public static Empty<T>(): IEnumerable<T> {
//         return [];
//     }
// }

//endregion

//region ====INotifyPropertyChanged====
export class PropertyChangedEventArgs {

    public constructor(propertyName: string | null) {
        this.PropertyName = propertyName;
    }

    public readonly PropertyName: string | null;
}

export type PropertyChangedEventHandler = (sender: any, e: PropertyChangedEventArgs) => void;

export interface INotifyPropertyChanged {
    get PropertyChanged(): Event<any, PropertyChangedEventArgs>;
}

export function IsInterfaceOfIEnumerable<T>(obj: any): obj is IEnumerable<T> {
    return isEnumerable(obj);
}

export function IsInterfaceOfINotifyPropertyChanged(obj: any): obj is INotifyPropertyChanged {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_System_INotifyPropertyChanged' in obj.constructor;
}

//endregion

//region ====INotifyCollectionChanged=====
export enum NotifyCollectionChangedAction {
    Add,
    Remove,
    Replace,
    Move,
    Reset,
}

export class NotifyCollectionChangedEventArgs {
    public readonly Action: NotifyCollectionChangedAction;
    public readonly NewItems: IList<any> | null;
    public readonly OldItems: IList<any> | null;
}

export type NotifyCollectionChangedEventHandler = (sender: any, e: NotifyCollectionChangedEventArgs) => void;

export interface INotifyCollectionChanged {
    get CollectionChanged(): Event<any, NotifyCollectionChangedEventArgs>;
}

export function IsInterfaceOfINotifyCollectionChanged(obj: any): obj is INotifyCollectionChanged {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_System_INotifyCollectionChanged' in obj.constructor;
}

//endregion

