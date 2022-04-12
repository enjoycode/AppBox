import {
    IAsyncEnumerable,
    IAsyncEqualityComparer,
    IAsyncParallel,
    IComparer,
    IEqualityComparer,
    IGrouping,
    InferType,
    IOrderedParallelEnumerable,
    OfType,
    SelectorKeyType,
    TypedData,
} from "./"

/**
 * Parallel Async Iterable type with methods from LINQ.
 */
export interface IParallelEnumerable<TSource> extends IAsyncParallel<TSource> {
    /**
     * Used for processing.
     */
    readonly dataFunc: TypedData<TSource>

    /**
     * Converts the parallel iterable to an @see {IAsyncEnumerable}
     * @returns An IAsyncEnumerable<T>
     */
    AsAsync(): IAsyncEnumerable<TSource>

    /**
     * Concatenates two async sequences.
     * @param second The async sequence to concatenate to the first sequence.
     * @returns An IParallelEnumerable<T> that contains the concatenated elements of the two sequences.
     */
    Concatenate(second: IAsyncParallel<TSource>): IParallelEnumerable<TSource>

    /**
     * Returns distinct elements from a sequence by using the default or specified equality comparer to compare values.
     * @param comparer An IEqualityComparer<T> to compare values. Optional. Defaults to Strict Equality Comparison.
     * @returns An IParallelEnumerable<T> that contains distinct elements from the source sequence.
     */
    Distinct(comparer?: IEqualityComparer<TSource>): IParallelEnumerable<TSource>

    /**
     * Returns distinct elements from a sequence by using the specified equality comparer to compare values.
     * @param comparer An IAsyncEqualityComparer<T> to compare values.
     * @returns An IParallelEnumerable<T> that contains distinct elements from the source sequence.
     */
    DistinctAsync(comparer: IAsyncEqualityComparer<TSource>): IParallelEnumerable<TSource>

    /**
     * Performs a specified action on each element of the IParallelEnumerable<TSource>.
     * The order of execution is not guaranteed.
     * @param action The action to take an each element
     * @returns A new IParallelEnumerable<T> that executes the action provided.
     */
    Each(action: (x: TSource) => void): IParallelEnumerable<TSource>

    /**
     * Performs a specified action on each element of the IParallelEnumerable<TSource>.
     * The order of execution is not guaranteed.
     * @param action The async action to take an each element
     * @returns A new IParallelEnumerable<T> that executes the action provided.
     */
    EachAsync(action: (x: TSource) => Promise<void>): IParallelEnumerable<TSource>

    /**
     * Produces the set difference of two sequences by using the comparer provided
     * or EqualityComparer to compare values.
     * @param second An IAsyncParallel<T> whose elements that also occur in the first sequence
     * will cause those elements to be removed from the returned sequence.
     * @param comparer An IEqualityComparer<T> to compare values. Optional.
     * @returns A sequence that contains the set difference of the elements of two sequences.
     */
    Except(second: IAsyncParallel<TSource>,
           comparer?: IEqualityComparer<TSource>): IParallelEnumerable<TSource>

    /**
     * Produces the set difference of two sequences by using the comparer provided to compare values.
     * @param second An IAsyncParallel<T> whose elements that also occur in the first sequence
     * will cause those elements to be removed from the returned sequence.
     * @param comparer An IAsyncEqualityComparer<T> to compare values.
     * @returns A sequence that contains the set difference of the elements of two sequences.
     */
    ExceptAsync(second: IAsyncParallel<TSource>,
                comparer: IAsyncEqualityComparer<TSource>): IParallelEnumerable<TSource>

    /**
     * Groups the elements of a sequence according to a specified key selector function.
     * @param keySelector A function to extract the key for each element.
     * @returns An IParallelEnumerable<IGrouping<TKey, TSource>>
     * where each IGrouping<TKey,TElement> object contains a sequence of objects and a key.
     */
    GroupBy<TKey extends SelectorKeyType>(
        keySelector: (x: TSource) => TKey): IParallelEnumerable<IGrouping<TKey, TSource>>

    /**
     * Groups the elements of a sequence according to a key selector function.
     * The keys are compared by using a comparer and each group's elements are projected by using a specified function.
     * @param keySelector A function to extract the key for each element.
     * @param comparer An IEqualityComparer<T> to compare keys.
     * @returns An IParallelEnumerable<IGrouping<TKey, TSource>>
     * where each IGrouping<TKey,TElement> object contains a sequence of objects and a key.
     */
    GroupBy<TKey>(
        keySelector: (x: TSource) => TKey,
        comparer: IEqualityComparer<TKey>): IParallelEnumerable<IGrouping<TKey, TSource>>

    /**
     * Groups the elements of a sequence according to a specified key selector function.
     * @param keySelector An async function to extract the key for each element.
     * @returns An IParallelEnumerable<IGrouping<TKey, TSource>>
     * where each IGrouping<TKey,TElement> object contains a sequence of objects and a key.
     */
    GroupByAsync<TKey extends SelectorKeyType>(
        keySelector: (x: TSource) => Promise<TKey>): IParallelEnumerable<IGrouping<TKey, TSource>>

    /**
     * Groups the elements of a sequence according to a specified key selector function.
     * @param keySelector An async function to extract the key for each element.
     * @param comparer An IEqualityComparer<T> or IAsyncEqualityComparer<T> to compare keys.
     * @returns An IParallelEnumerable<IGrouping<TKey, TSource>>
     * where each IGrouping<TKey,TElement> object contains a sequence of objects and a key.
     */
    GroupByAsync<TKey>(
        keySelector: (x: TSource) => Promise<TKey> | TKey,
        comparer: IEqualityComparer<TKey> | IAsyncEqualityComparer<TKey>)
        : IParallelEnumerable<IGrouping<TKey, TSource>>

    GroupByWithSel<TElement, TKey extends SelectorKeyType>(
        keySelector: ((x: TSource) => TKey),
        elementSelector: (x: TSource) => TElement): IParallelEnumerable<IGrouping<TKey, TElement>>

    GroupByWithSel<TKey, TElement>(
        keySelector: ((x: TSource) => TKey),
        elementSelector: (x: TSource) => TElement,
        comparer: IEqualityComparer<TKey>): IParallelEnumerable<IGrouping<TKey, TElement>>

    Intersect(second: IAsyncParallel<TSource>,
              comparer?: IEqualityComparer<TSource>): IParallelEnumerable<TSource>

    IntersectAsync(second: IAsyncParallel<TSource>,
                   comparer: IAsyncEqualityComparer<TSource>): IParallelEnumerable<TSource>

    // join in LINQ - but renamed to avoid clash with Array.prototype.join
    JoinByKey<TInner, TKey, TResult>(
        inner: IAsyncParallel<TInner>,
        outerKeySelector: (x: TSource) => TKey,
        innerKeySelector: (x: TInner) => TKey,
        resultSelector: (x: TSource, y: TInner) => TResult,
        comparer?: IEqualityComparer<TKey>): IParallelEnumerable<TResult>

    OfType<TType extends OfType>(type: TType): IParallelEnumerable<InferType<TType>>

    OrderBy<TKey>(
        predicate: (x: TSource) => TKey,
        comparer?: IComparer<TKey>): IOrderedParallelEnumerable<TSource>

    OrderByAsync<TKey>(
        predicate: (x: TSource) => Promise<TKey>,
        comparer?: IComparer<TKey>): IOrderedParallelEnumerable<TSource>

    OrderByDescending<TKey>(
        predicate: (x: TSource) => TKey,
        comparer?: IComparer<TKey>): IParallelEnumerable<TSource>

    OrderByDescendingAsync<TKey>(
        predicate: (x: TSource) => Promise<TKey>,
        comparer?: IComparer<TKey>): IParallelEnumerable<TSource>

    /**
     * Inverts the order of the elements in a sequence.
     * @returns A sequence whose elements correspond to those of the input sequence in reverse order.
     */
    Reverse(): IParallelEnumerable<TSource>

    Select<TResult>(selector: (x: TSource, index: number) => TResult): IParallelEnumerable<TResult>

    Select<TKey extends keyof TSource>(key: TKey): IParallelEnumerable<TSource[TKey]>

    SelectAsync<TResult>(
        selector: (x: TSource, index: number) => Promise<TResult>): IParallelEnumerable<TResult>

    SelectAsync<TKey extends keyof TSource, TResult>(
        this: IParallelEnumerable<{ [key: string]: Promise<TResult> }>,
        selector: TKey): IParallelEnumerable<TResult>

    SelectMany<TResult>(selector: (x: TSource, index: number) => Iterable<TResult>): IParallelEnumerable<TResult>

    SelectMany<TBindedSource extends { [key: string]: Iterable<TOut> }, TOut>(
        this: IParallelEnumerable<TBindedSource>,
        selector: keyof TBindedSource): IParallelEnumerable<TOut>

    SelectManyAsync<TResult>(
        selector: (x: TSource, index: number) => Promise<Iterable<TResult>>): IParallelEnumerable<TResult>

    SequenceEquals(second: IAsyncParallel<TSource>,
                   comparer?: IEqualityComparer<TSource>): Promise<boolean>

    SequenceEqualsAsync(second: IAsyncParallel<TSource>,
                        comparer?: IAsyncEqualityComparer<TSource>): Promise<boolean>

    Skip(count: number): IParallelEnumerable<TSource>

    SkipWhile(predicate: (x: TSource, index: number) => boolean): IParallelEnumerable<TSource>

    SkipWhileAsync(predicate: (x: TSource, index: number) => Promise<boolean>): IParallelEnumerable<TSource>

    Take(amount: number): IParallelEnumerable<TSource>

    TakeWhile(predicate: (x: TSource, index: number) => boolean): IParallelEnumerable<TSource>

    TakeWhileAsync(predicate: (x: TSource, index: number) => Promise<boolean>): IParallelEnumerable<TSource>

    Union(second: IAsyncParallel<TSource>,
          comparer?: IEqualityComparer<TSource>): IParallelEnumerable<TSource>

    UnionAsync(second: IAsyncParallel<TSource>,
               comparer?: IAsyncEqualityComparer<TSource>): IParallelEnumerable<TSource>

    /**
     * Filters a sequence of values based on a predicate.
     * Each element's index is used in the logic of the predicate function.
     * @param predicate A function to test each source element for a condition;
     * the second parameter of the function represents the index of the source element.
     * @returns An IParallelEnumerable<T> that contains elements from the input sequence that satisfy the condition.
     */
    Where(predicate: (x: TSource, index: number) => boolean): IParallelEnumerable<TSource>

    /**
     * Filters a sequence of values based on a predicate.
     * Each element's index is used in the logic of the predicate function.
     * @param predicate A async function to test each source element for a condition;
     * the second parameter of the function represents the index of the source element.
     * @returns An IParallelEnumerable<T> that contains elements from the input sequence that satisfy the condition.
     */
    WhereAsync(predicate: (x: TSource, index: number) => Promise<boolean>): IParallelEnumerable<TSource>

    Zip<TSecond, TResult>(
        second: IAsyncParallel<TSecond>,
        resultSelector: (x: TSource, y: TSecond) => TResult): IParallelEnumerable<TResult>

    Zip<TSecond>(second: IAsyncParallel<TSecond>):
        IParallelEnumerable<[TSource, TSecond]>

    ZipAsync<TSecond, TResult>(
        second: IAsyncParallel<TSecond>,
        resultSelector: (x: TSource, y: TSecond) => Promise<TResult>): IParallelEnumerable<TResult>
}
