import {IComparer, IParallelEnumerable} from "./"

/**
 * Represents an async parallel enumeration that has been ordered.
 */
export interface IOrderedParallelEnumerable<TSource> extends IParallelEnumerable<TSource> {
    ThenBy<TKey>(
        keySelector: (x: TSource) => TKey,
        comparer?: IComparer<TKey>): IOrderedParallelEnumerable<TSource>

    ThenByAsync<TKey>(
        keySelector: (x: TSource) => Promise<TKey>,
        comparer?: IComparer<TKey>): IOrderedParallelEnumerable<TSource>

    ThenByDescending<TKey>(
        keySelector: (x: TSource) => TKey,
        comparer?: IComparer<TKey>): IOrderedParallelEnumerable<TSource>

    ThenByDescendingAsync<TKey>(
        keySelector: (x: TSource) => Promise<TKey>,
        comparer?: IComparer<TKey>): IOrderedParallelEnumerable<TSource>
}
