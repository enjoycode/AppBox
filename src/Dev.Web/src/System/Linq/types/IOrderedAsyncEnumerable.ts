import {IAsyncEnumerable, IComparer} from "./"

/**
 * Represents an async enumeration that has been ordered.
 */
export interface IOrderedAsyncEnumerable<TSource> extends IAsyncEnumerable<TSource> {
    ThenBy<TKey>(
        keySelector: (x: TSource) => TKey,
        comparer?: IComparer<TKey>): IOrderedAsyncEnumerable<TSource>

    ThenByAsync<TKey>(
        keySelector: (x: TSource) => Promise<TKey>,
        comparer?: IComparer<TKey>): IOrderedAsyncEnumerable<TSource>

    ThenByDescending<TKey>(
        keySelector: (x: TSource) => TKey,
        comparer?: IComparer<TKey>): IOrderedAsyncEnumerable<TSource>

    ThenByDescendingAsync<TKey>(
        keySelector: (x: TSource) => Promise<TKey>,
        comparer?: IComparer<TKey>): IOrderedAsyncEnumerable<TSource>
}
