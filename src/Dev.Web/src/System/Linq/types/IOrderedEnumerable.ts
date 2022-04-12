import {IComparer, IEnumerable, IOrderedAsyncEnumerable} from "./"

/**
 * Ordered Iterable type with methods from LINQ.
 */
export interface IOrderedEnumerable<TSource> extends IEnumerable<TSource> {
    ThenBy<TKey>(
        keySelector: (x: TSource) => TKey,
        comparer?: IComparer<TKey>): IOrderedEnumerable<TSource>

    ThenByAsync<TKey>(
        keySelector: (x: TSource) => Promise<TKey>,
        comparer?: IComparer<TKey>): IOrderedAsyncEnumerable<TSource>

    ThenByDescending<TKey>(
        keySelector: (x: TSource) => TKey,
        comparer?: IComparer<TKey>): IOrderedEnumerable<TSource>

    ThenByDescendingAsync<TKey>(
        keySelector: (x: TSource) => Promise<TKey>,
        comparer?: IComparer<TKey>): IOrderedAsyncEnumerable<TSource>
}
