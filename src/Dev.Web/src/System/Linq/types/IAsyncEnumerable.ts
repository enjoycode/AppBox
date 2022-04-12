import {
    IAsyncEqualityComparer,
    IAsyncParallel,
    IComparer,
    IEqualityComparer,
    IGrouping,
    InferType,
    IOrderedAsyncEnumerable,
    IParallelEnumerable,
    OfType,
    SelectorKeyType
} from "./"

/**
 * Async Iterable type with methods from LINQ.
 */
export interface IAsyncEnumerable<TSource> extends IAsyncParallel<TSource> {
    /**
     * Converts an async iterable to a Parallel Enumerable.
     * @returns Parallel Enumerable of source
     */
    AsParallel(): IParallelEnumerable<TSource>

    /**
     * Concatenates two async sequences.
     * @param second The sequence to concatenate to the first sequence.
     * @returns An IAsyncEnumerable<T> that contains the concatenated elements of the two sequences.
     */
    Concatenate(second: IAsyncEnumerable<TSource>): IAsyncEnumerable<TSource>

    /**
     * Returns distinct elements from a sequence by using the default
     * or specified equality comparer to compare values.
     * @param comparer An IEqualityComparer<T> to compare values. Optional. Defaults to Strict Equality Comparison.
     * @returns An IAsyncEnumerable<T> that contains distinct elements from the source sequence.
     */
    Distinct(comparer?: IEqualityComparer<TSource>): IAsyncEnumerable<TSource>

    /**
     * Returns distinct elements from a sequence by using the specified equality comparer to compare values.
     * @param comparer An IAsyncEqualityComparer<T> to compare values.
     * @returns An IAsyncEnumerable<T> that contains distinct elements from the source sequence.
     */
    DistinctAsync(comparer: IAsyncEqualityComparer<TSource>): IAsyncEnumerable<TSource>

    /**
     * Performs a specified action on each element of the Iterable<TSource>
     * @param action The action to take an each element
     * @returns A new IAsyncEnumerable<T> that executes the action lazily as you iterate.
     */
    Each(action: (x: TSource) => void): IAsyncEnumerable<TSource>

    /**
     * Performs a specified action on each element of the Iterable<TSource>
     * @param action The async action to take an each element
     * @returns A new IAsyncEnumerable<T> that executes the action lazily as you iterate.
     */
    EachAsync(action: (x: TSource) => Promise<void>): IAsyncEnumerable<TSource>

    /**
     * Produces the set difference of two sequences by using the comparer provided
     * or EqualityComparer to compare values.
     * @param second An IAsyncEnumerable<T> whose elements that also occur in the first sequence
     * will cause those elements to be removed from the returned sequence.
     * @param comparer An IEqualityComparer<T> to compare values. Optional.
     * @returns A sequence that contains the set difference of the elements of two sequences.
     */
    Except(second: IAsyncEnumerable<TSource>, comparer?: IEqualityComparer<TSource>): IAsyncEnumerable<TSource>

    /**
     * Produces the set difference of two sequences by using the comparer provided to compare values.
     * @param second An IAsyncEnumerable<T> whose elements that also occur in the first sequence
     * will cause those elements to be removed from the returned sequence.
     * @param comparer An IAsyncEqualityComparer<T> to compare values.
     * @returns A sequence that contains the set difference of the elements of two sequences.
     */
    ExceptAsync(
        second: IAsyncEnumerable<TSource>,
        comparer: IAsyncEqualityComparer<TSource>): IAsyncEnumerable<TSource>

    /**
     * Groups the elements of a sequence according to a specified key selector function.
     * @param keySelector A function to extract the key for each element.
     * @returns An IAsyncEnumerable<IGrouping<TKey, TSource>>
     * where each IGrouping<TKey,TElement> object contains a sequence of objects and a key.
     */
    GroupBy<TKey extends SelectorKeyType>(
        keySelector: (x: TSource) => TKey): IAsyncEnumerable<IGrouping<TKey, TSource>>

    /**
     * Groups the elements of a sequence according to a key selector function.
     * The keys are compared by using a comparer and each group's elements are projected by using a specified function.
     * @param keySelector A function to extract the key for each element.
     * @param comparer An IAsyncEqualityComparer<T> to compare keys.
     */
    GroupBy<TKey>(
        keySelector: (x: TSource) => TKey,
        comparer: IEqualityComparer<TKey>): IAsyncEnumerable<IGrouping<TKey, TSource>>

    /**
     * Groups the elements of a sequence according to a specified key selector function.
     * @param keySelector A function to extract the key for each element.
     * @returns An IAsyncEnumerable<IGrouping<TKey, TSource>>
     * where each IGrouping<TKey,TElement> object contains a sequence of objects and a key.
     */
    GroupByAsync<TKey extends SelectorKeyType>(
        keySelector: (x: TSource) => Promise<TKey> | TKey): IAsyncEnumerable<IGrouping<TKey, TSource>>

    /**
     * Groups the elements of a sequence according to a specified key selector function.
     * @param keySelector A function to extract the key for each element.
     * @param comparer An IEqualityComparer<T> or IAsyncEqualityComparer<T> to compare keys.
     * @returns An IAsyncEnumerable<IGrouping<TKey, TSource>>
     * where each IGrouping<TKey,TElement> object contains a sequence of objects and a key.
     */
    GroupByAsync<TKey>(
        keySelector: (x: TSource) => Promise<TKey> | TKey,
        comparer: IEqualityComparer<TKey> | IAsyncEqualityComparer<TKey>): IAsyncEnumerable<IGrouping<TKey, TSource>>

    /**
     * Groups the elements of a sequence according to a specified key selector function and
     * projects the elements for each group by using a specified function.
     * @param keySelector A function to extract the key for each element.
     * @param elementSelector A function to map each source element to an element in an IGrouping<TKey,TElement>.
     * @param comparer An IEqualityComparer<T> to compare keys.
     * @returns An IAsyncEnumerable<IGrouping<TKey, TElement>>
     * where each IGrouping<TKey,TElement> object contains a collection of objects of type TElement and a key.
     */
    GroupByWithSel<TKey extends SelectorKeyType, TElement>(
        keySelector: (x: TSource) => TKey,
        elementSelector: (x: TSource) => TElement,
        comparer?: IEqualityComparer<TKey>): IAsyncEnumerable<IGrouping<TKey, TElement>>

    /**
     * Groups the elements of a sequence according to a key selector function.
     * The keys are compared by using a comparer and each group's elements are projected by using a specified function.
     * @param keySelector A function to extract the key for each element.
     * @param elementSelector A function to map each source element to an element in an IGrouping<TKey,TElement>.
     * @param comparer An IEqualityComparer<T> to compare keys.
     * @returns An IAsyncEnumerable<IGrouping<TKey,TElement>>
     * where each IGrouping<TKey,TElement> object contains a collection of objects of type TElement and a key.
     */
    GroupByWithSel<TKey, TElement>(
        keySelector: ((x: TSource) => TKey),
        elementSelector: (x: TSource) => TElement,
        comparer: IEqualityComparer<TKey>): IAsyncEnumerable<IGrouping<TKey, TElement>>

    /**
     * Produces the set intersection of two sequences by using the specified IEqualityComparer<T> to compare values.
     * If no comparer is selected, uses the StrictEqualityComparer.
     * @param second An Iterable<T> whose distinct elements that also appear in the first sequence will be returned.
     * @param comparer An IEqualityComparer<T> to compare values. Optional.
     * @returns An async sequence that contains the elements that form the set intersection of two sequences.
     */
    Intersect(second: IAsyncEnumerable<TSource>, comparer?: IEqualityComparer<TSource>): IAsyncEnumerable<TSource>

    /**
     * Produces the set intersection of two sequences by using the specified
     * IAsyncEqualityComparer<T> to compare values.
     * @param second An Iterable<T> whose distinct elements that also appear in the first sequence will be returned.
     * @param comparer An IAsyncEqualityComparer<T> to compare values.
     * @returns A sequence that contains the elements that form the set intersection of two sequences.
     */
    IntersectAsync(
        second: IAsyncEnumerable<TSource>,
        comparer: IAsyncEqualityComparer<TSource>): IAsyncEnumerable<TSource>

    /**
     * Correlates the elements of two sequences based on matching keys.
     * A specified IEqualityComparer<T> is used to compare keys or the strict equality comparer.
     * @param inner The sequence to join to the first sequence.
     * @param outerKeySelector A function to extract the join key from each element of the first sequence.
     * @param innerKeySelector A function to extract the join key from each element of the second sequence.
     * @param resultSelector A function to create a result element from two matching elements.
     * @param comparer An IEqualityComparer<T> to hash and compare keys. Optional.
     * @returns An IAsyncEnumerable<T> that has elements of type TResult that
     * are obtained by performing an inner join on two sequences.
     */
    JoinByKey<TInner, TKey, TResult>(
        inner: IAsyncEnumerable<TInner>,
        outerKeySelector: (x: TSource) => TKey,
        innerKeySelector: (x: TInner) => TKey,
        resultSelector: (x: TSource, y: TInner) => TResult,
        comparer?: IEqualityComparer<TKey>): IAsyncEnumerable<TResult>

    /**
     * Applies a type filter to a source iteration
     * @param type Either value for typeof or a consturctor function
     * @returns Values that match the type string or are instance of type
     */
    OfType<TType extends OfType>(type: TType): IAsyncEnumerable<InferType<TType>>

    /**
     * Sorts the elements of a sequence in ascending order by using a specified or default comparer.
     * @param keySelector A function to extract a key from an element.
     * @param comparer An IComparer<T> to compare keys. Optional.
     * @returns An IOrderedAsyncEnumerable<TElement> whose elements are sorted according to a key.
     */
    OrderBy<TKey>(
        predicate: (x: TSource) => TKey,
        comparer?: IComparer<TKey>): IOrderedAsyncEnumerable<TSource>

    /**
     * Sorts the elements of a sequence in ascending order by using a specified comparer.
     * @param keySelector An async function to extract a key from an element.
     * @param comparer An IComparer<T> to compare keys.
     * @returns An IOrderedAsyncEnumerable<TElement> whose elements are sorted according to a key.
     */
    OrderByAsync<TKey>(
        predicate: (x: TSource) => Promise<TKey>,
        comparer?: IComparer<TKey>): IOrderedAsyncEnumerable<TSource>

    /**
     * Sorts the elements of a sequence in descending order by using a specified or default comparer.
     * @param keySelector A function to extract a key from an element.
     * @param comparer An IComparer<T> to compare keys. Optional.
     * @returns An IOrderedAsyncEnumerable<TElement> whose elements are sorted in descending order according to a key.
     */
    OrderByDescending<TKey>(
        predicate: (x: TSource) => TKey,
        comparer?: IComparer<TKey>): IOrderedAsyncEnumerable<TSource>

    /**
     * Sorts the elements of a sequence in descending order by using a specified comparer.
     * @param keySelector An async function to extract a key from an element.
     * @param comparer An IComparer<T> to compare keys.
     * @returns An IOrderedAsyncEnumerable<TElement> whose elements are sorted in descending order according to a key.
     */
    OrderByDescendingAsync<TKey>(
        predicate: (x: TSource) => Promise<TKey>,
        comparer?: IComparer<TKey>): IOrderedAsyncEnumerable<TSource>

    /**
     * Inverts the order of the elements in a sequence.
     * @returns An async sequence whose elements correspond to those of the input sequence in reverse order.
     */
    Reverse(): IAsyncEnumerable<TSource>

    /**
     * Projects each element of a sequence into a new form.
     * @param selector A transform function to apply to each element.
     * @returns An IAsyncEnumerable<T> whose elements are the result of
     * invoking the transform function on each element of source.
     */
    Select<TResult>(selector: (x: TSource, index: number) => TResult): IAsyncEnumerable<TResult>

    /**
     * Projects each element of a sequence into a new form.
     * @param selector A key of TSource.
     * @returns
     * An IAsyncEnumerable<T> whose elements are the result of getting the value from the key on each element of source.
     */
    Select<TKey extends keyof TSource>(key: TKey): IAsyncEnumerable<TSource[TKey]>

    /**
     * Projects each element of a sequence into a new form.
     * @param selector An async transform function to apply to each element.
     * @returns An IAsyncEnumerable<T> whose elements are the result of invoking
     * the transform function on each element of source.
     */
    SelectAsync<TResult>(selector: (x: TSource, index: number) => Promise<TResult>): IAsyncEnumerable<TResult>

    /**
     * Projects each element of a sequence into a new form.
     * @param key A key of the elements in the sequence
     * @returns An IAsyncEnumerable<T> whoe elements are the result of getting the value for key
     * on each element of source.
     */
    SelectAsync<TKey extends keyof TSource, TResult>(
        this: IAsyncEnumerable<{ [key: string]: Promise<TResult> }>,
        key: TKey): IAsyncEnumerable<TResult>

    /**
     * Projects each element of a sequence to an IAsyncEnumerable<T>
     * and flattens the resulting sequences into one sequence.
     * @param selector A transform function to apply to each element.
     * @returns An IAsyncEnumerable<T> whose elements are the result of invoking the
     * one-to-many transform function on each element of the input sequence.
     */
    SelectMany<TResult>(selector: (x: TSource, index: number) => Iterable<TResult>): IAsyncEnumerable<TResult>

    /**
     * Projects each element of a sequence to an IAsyncEnumerable<T>
     * and flattens the resulting sequences into one sequence.
     * @param selector A string key of TSource.
     * @returns An IAsyncEnumerable<T> whose elements are the result of invoking the
     * parameter the key is tried to on each element of the input sequence.
     */
    SelectMany<TBindedSource extends { [key: string]: Iterable<TOut> }, TOut>(
        this: IAsyncEnumerable<TBindedSource>,
        selector: keyof TBindedSource): IAsyncEnumerable<TOut>

    /**
     * Projects each element of a sequence to an IAsyncEnumerable<T>
     * and flattens the resulting sequences into one sequence.
     * @param selector A transform function to apply to each element.
     * @returns An IAsyncEnumerable<T> whose elements are the result of invoking the
     * one-to-many transform function on each element of the input sequence.
     */
    SelectManyAsync<TResult>(
        selector: (x: TSource, index: number) => Promise<Iterable<TResult>>): IAsyncEnumerable<TResult>

    /**
     * Determines whether or not two sequences are equal
     * @param second second iterable
     * @param comparer Compare function to use, by default is @see {StrictEqualityComparer}
     * @returns Whether or not the two iterations are equal
     */
    SequenceEquals(second: AsyncIterable<TSource>, comparer?: IEqualityComparer<TSource>): Promise<boolean>

    /**
     * Compares two sequences to see if they are equal using an async comparer function.
     * @param second Second Sequence
     * @param comparer Async Comparer
     * @returns Whether or not the two iterations are equal
     */
    SequenceEqualsAsync(second: AsyncIterable<TSource>,
                        comparer: IAsyncEqualityComparer<TSource>): Promise<boolean>

    /**
     * Bypasses a specified number of elements in a sequence and then returns the remaining elements.
     * @param count The number of elements to skip before returning the remaining elements.
     * @returns An IAsyncEnumerable<T> that contains the elements
     * that occur after the specified index in the input sequence.
     */
    Skip(count: number): IAsyncEnumerable<TSource>

    /**
     * Bypasses elements in a sequence as long as a specified condition is true and then returns the remaining elements.
     * The element's index is used in the logic of the predicate function.
     * @param predicate A function to test each source element for a condition;
     * the second parameter of the function represents the index of the source element.
     * @returns An IAsyncEnumerable<T> that contains the elements from the input sequence starting at the first element
     * in the linear series that does not pass the test specified by predicate.
     */
    SkipWhile(predicate: (x: TSource, index: number) => boolean): IAsyncEnumerable<TSource>

    /**
     * Bypasses elements in a sequence as long as a specified condition is true and then returns the remaining elements.
     * The element's index is used in the logic of the predicate function.
     * @param predicate A function to test each source element for a condition;
     * the second parameter of the function represents the index of the source element.
     * @returns An IAsyncEnumerable<T> that contains the elements from the input sequence starting
     * at the first element in the linear series that does not pass the test specified by predicate.
     */
    SkipWhileAsync(predicate: (x: TSource, index: number) => Promise<boolean>): IAsyncEnumerable<TSource>

    /**
     * Returns a specified number of contiguous elements from the start of a sequence.
     * @param amount The number of elements to return.
     * @returns An IAsyncEnumerable<T> that contains the specified
     * number of elements from the start of the input sequence.
     */
    Take(amount: number): IAsyncEnumerable<TSource>

    /**
     * Returns elements from a sequence as long as a specified condition is true.
     * The element's index is used in the logic of the predicate function.
     * @param predicate A function to test each source element for a condition;
     * the second parameter of the function represents the index of the source element.
     * @returns An IAsyncEnumerable<T> that contains elements from the input sequence
     * that occur before the element at which the test no longer passes.
     */
    TakeWhile(pedicate: (x: TSource, index: number) => boolean): IAsyncEnumerable<TSource>

    /**
     * Returns elements from a sequence as long as a specified condition is true.
     * The element's index is used in the logic of the predicate function.
     * @param predicate A async function to test each source element for a condition;
     * the second parameter of the function represents the index of the source element.
     * @returns An IAsyncEnumerable<T> that contains elements from the input sequence
     * that occur before the element at which the test no longer passes.
     */
    TakeWhileAsync(pedicate: (x: TSource, index: number) => Promise<boolean>): IAsyncEnumerable<TSource>

    /**
     * Produces the set union of two sequences by using scrict equality comparison or a specified IEqualityComparer<T>.
     * @param second An AsyncIterable<T> whose distinct elements form the second set for the union.
     * @param comparer The IEqualityComparer<T> to compare values. Optional.
     * @returns An IAsyncEnumerable<T> that contains the elements from both input sequences, excluding duplicates.
     */
    Union(second: AsyncIterable<TSource>, comparer?: IEqualityComparer<TSource>): IAsyncEnumerable<TSource>

    /**
     * Produces the set union of two sequences by using a specified IAsyncEqualityComparer<T>.
     * @param second An AsyncIterable<T> whose distinct elements form the second set for the union.
     * @param comparer The IAsyncEqualityComparer<T> to compare values.
     * @returns An IAsyncEnumerable<T> that contains the elements from both input sequences, excluding duplicates.
     */
    UnionAsync(second: AsyncIterable<TSource>, comparer: IAsyncEqualityComparer<TSource>): IAsyncEnumerable<TSource>

    /**
     * Filters a sequence of values based on a predicate.
     * Each element's index is used in the logic of the predicate function.
     * @param predicate A function to test each source element for a condition;
     * the second parameter of the function represents the index of the source element.
     * @returns An IAsyncEnumerable<T> that contains elements from the input sequence that satisfy the condition.
     */
    Where(predicate: (x: TSource, index: number) => boolean): IAsyncEnumerable<TSource>

    /**
     * Filters a sequence of values based on a predicate.
     * Each element's index is used in the logic of the predicate function.
     * @param predicate A async function to test each source element for a condition;
     * the second parameter of the function represents the index of the source element.
     * @returns An IAsyncEnumerable<T> that contains elements from the input sequence that satisfy the condition.
     */
    WhereAsync(predicate: (x: TSource, index: number) => Promise<boolean>): IAsyncEnumerable<TSource>

    /**
     * Applies a specified function to the corresponding elements of two sequences, producing a sequence of the results.
     * @param second The second sequence to merge.
     * @param resultSelector A function that specifies how to merge the elements from the two sequences.
     * @returns An IAsyncEnumerable<TResult> that contains merged elements of two input sequences.
     */
    Zip<TSecond, TResult>(
        second: AsyncIterable<TSecond>,
        resultSelector: (x: TSource, y: TSecond) => TResult): IAsyncEnumerable<TResult>

    /**
     * Creates a tuple of corresponding elements of two sequences, producing a sequence of the results.
     * @param second The second sequence to merge.
     * @returns An IAsyncEnumerable<[T, Y]> that contains merged elements of two input sequences.
     */
    Zip<TSecond>(second: AsyncIterable<TSecond>): IAsyncEnumerable<[TSource, TSecond]>

    /**
     * Applies a specified async function to the corresponding elements of two sequences,
     * producing a sequence of the results.
     * @param second The second sequence to merge.
     * @param resultSelector An async function that specifies how to merge the elements from the two sequences.
     * @returns An IAsyncEnumerable<T> that contains merged elements of two input sequences.
     */
    ZipAsync<TSecond, TResult>(
        second: AsyncIterable<TSecond>,
        resultSelector: (x: TSource, y: TSecond) => Promise<TResult>): IAsyncEnumerable<TResult>
}
