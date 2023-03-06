import {
    IAsyncEnumerable,
    IAsyncEqualityComparer,
    IComparer,
    IEqualityComparer,
    IGrouping,
    InferType,
    IOrderedAsyncEnumerable,
    IOrderedEnumerable,
    IParallelEnumerable,
    OfType,
    SelectorKeyType
} from "./"
import {IList} from '../../Collections/IList'

/**
 * Iterable type with methods from LINQ.
 */
export interface IEnumerable<TSource> extends Iterable<TSource> {
    /**
     * Applies an accumulator function over a sequence.
     * @param func An accumulator function to be invoked on each element.
     * @returns The final accumulator value.
     */
    Aggregate(func: (x: TSource, y: TSource) => TSource): TSource

    /**
     * Applies an accumulator function over a sequence.
     * The specified seed value is used as the initial accumulator value.
     * @param seed The initial accumulator value.
     * @param func An accumulator function to be invoked on each element.
     * @returns The final accumulator value.
     */
    Aggregate<TAccumulate>(seed: TAccumulate, func: (x: TAccumulate, y: TSource) => TAccumulate): TAccumulate

    /**
     * Applies an accumulator function over a sequence.
     * The specified seed value is used as the initial accumulator value,
     * and the specified function is used to select the result value.
     * @param seed The initial accumulator value.
     * @param func An accumulator function to be invoked on each element.
     * @param resultSelector A function to transform the final accumulator value into the result value.
     * @returns The transformed final accumulator value.
     */
    Aggregate<TAccumulate, TResult>(
        seed: TAccumulate,
        func: (x: TAccumulate, y: TSource) => TAccumulate,
        resultSelector: (x: TAccumulate) => TResult): TResult

    /**
     * Determines whether all elements of a sequence satisfy a condition.
     * @param predicate A function to test each element for a condition.
     * @returns ``true`` if every element of the source sequence passes the test in the specified predicate,
     * or if the sequence is empty; otherwise, ``false``.
     */
    All(predicate: (x: TSource) => boolean): boolean

    /**
     * Determines whether all elements of a sequence satisfy a condition.
     * @param predicate An async function to test each element for a condition.
     * @returns ``true`` if every element of the source sequence passes the test in the specified predicate,
     * or if the sequence is empty; otherwise, ``false``.
     */
    AllAsync(predicate: (x: TSource) => Promise<boolean>): Promise<boolean>

    /**
     * Determines whether a sequence contains any elements.
     * If predicate is specified, determines whether any element of a sequence satisfies a condition.
     * @param predicate A function to test each element for a condition.
     * @returns true if the source sequence contains any elements or passes the test specified; otherwise, false.
     */
    Any(predicate?: (x: TSource) => boolean): boolean

    /**
     * Determines whether any element of a sequence satisfies a condition.
     * @param predicate An async function to test each element for a condition.
     * @returns true if the source sequence contains any elements or passes the test specified; otherwise, false.
     */
    AnyAsync(predicate: (x: TSource) => Promise<boolean>): Promise<boolean>

    /**
     * Converts the iterable to an @see {IAsyncEnumerable}
     * @returns An IAsyncEnumerable<T>
     */
    AsAsync(): IAsyncEnumerable<TSource>

    /**
     * Converts an iterable to @see {IParallelEnumerable}
     * @returns An IParallelEnumerable<T>
     */
    AsParallel(): IParallelEnumerable<TSource>

    /**
     * Computes the average of a sequence of number values.
     * @throws {import('../types/InvalidOperationException')} source contains no elements.
     * @returns The average of the sequence of values.
     */
    Average(this: IEnumerable<number>): number

    /**
     * Computes the average of a sequence of values
     * that are obtained by invoking a transform function on each element of the input sequence.
     * @param selector A transform function to apply to each element.
     * @throws {import('../types/InvalidOperationException')} source contains no elements.
     * @returns The average of the sequence of values.
     */
    Average(selector: (x: TSource) => number): number

    /**
     * Computes the average of a sequence of values
     * that are obtained by invoking a transform function on each element of the input sequence.
     * @param selector An async transform function to apply to each element.
     * @throws {import('../types/InvalidOperationException')} source contains no elements.
     * @returns The average of the sequence of values.
     */
    AverageAsync(selector: (x: TSource) => Promise<number>): Promise<number>

    Cast<TResult>(): IEnumerable<TResult>

    /**
     * Concatenates two sequences.
     * @param second The sequence to concatenate to the first sequence.
     * @returns An IEnumerable<T> that contains the concatenated elements of the two sequences.
     */
    Concatenate(second: IEnumerable<TSource>): IEnumerable<TSource>

    /**
     * Determines whether a sequence contains a specified element by
     * using the specified or default IEqualityComparer<T>.
     * @param value The value to locate in the sequence.
     * @param comparer An equality comparer to compare values. Optional.
     * @returns true if the source sequence contains an element that has the specified value; otherwise, false.
     */
    Contains(value: TSource, comparer?: IEqualityComparer<TSource>): boolean

    /**
     * Determines whether a sequence contains a specified element
     * by using the specified or default IEqualityComparer<T>.
     * @param value The value to locate in the sequence.
     * @param comparer An async equality comparer to compare values.
     * @returns true if the source sequence contains an element that has the specified value; otherwise, false.
     */
    ContainsAsync(value: TSource, comparer: IAsyncEqualityComparer<TSource>): Promise<boolean>

    /**
     * Returns the number of elements in a sequence
     * or represents how many elements in the specified sequence satisfy a condition
     * if the predicate is specified.
     * @param predicate A function to test each element for a condition. Optional.
     * @returns The number of elements in the input sequence.
     */
    Count(predicate?: (x: TSource) => boolean): number

    /**
     * Returns the number of elements in a sequence
     * or represents how many elements in the specified sequence satisfy a condition
     * if the predicate is specified.
     * @param predicate A function to test each element for a condition.
     * @returns The number of elements in the input sequence.
     */
    CountAsync(predicate: (x: TSource) => Promise<boolean>): Promise<number>

    /**
     * Returns distinct elements from a sequence by using the default or specified equality comparer to compare values.
     * @param comparer An IEqualityComparer<T> to compare values. Optional. Defaults to Strict Equality Comparison.
     * @returns An IEnumerable<T> that contains distinct elements from the source sequence.
     */
    Distinct(comparer?: IEqualityComparer<TSource>): IEnumerable<TSource>

    /**
     * Returns distinct elements from a sequence by using the specified equality comparer to compare values.
     * @param comparer An IAsyncEqualityComparer<T> to compare values.
     * @returns An IAsyncEnumerable<T> that contains distinct elements from the source sequence.
     */
    DistinctAsync(comparer: IAsyncEqualityComparer<TSource>): IAsyncEnumerable<TSource>

    /**
     * Performs a specified action on each element of the Iterable<TSource>
     * @param action The action to take an each element
     * @returns A new IEnumerable<T> that executes the action lazily as you iterate.
     */
    Each(action: (x: TSource) => void): IEnumerable<TSource>

    /**
     * Performs a specified action on each element of the Iterable<TSource>
     * @param action The async action to take an each element
     * @returns A new IAsyncEnumerable<T> that executes the action lazily as you iterate.
     */
    EachAsync(action: (x: TSource) => Promise<void>): IAsyncEnumerable<TSource>

    /**
     * Returns the element at a specified index in a sequence.
     * @param index The zero-based index of the element to retrieve.
     * @throws {import('../types/ArgumentOutOfRangeException')}
     * index is less than 0 or greater than or equal to the number of elements in source.
     * @returns The element at the specified position in the source sequence.
     */
    ElementAt(index: number): TSource

    /**
     * Returns the element at a specified index in a sequence or a default value if the index is out of range.
     * @param index The zero-based index of the element to retrieve.
     * @returns
     * null if the index is outside the bounds of the source sequence;
     * otherwise, the element at the specified position in the source sequence.
     */
    ElementAtOrDefault(index: number): TSource | null

    /**
     * Produces the set difference of two sequences by using the comparer provided
     * or EqualityComparer to compare values.
     * @param second An IEnumerable<T> whose elements that also occur in the first sequence
     * will cause those elements to be removed from the returned sequence.
     * @param comparer An IEqualityComparer<T> to compare values. Optional.
     * @returns A sequence that contains the set difference of the elements of two sequences.
     */
    Except(second: Iterable<TSource>, comparer?: IEqualityComparer<TSource>): IEnumerable<TSource>

    /**
     * Produces the set difference of two sequences by using the comparer provided to compare values.
     * @param second An IEnumerable<T> whose elements that also occur in the first sequence
     * will cause those elements to be removed from the returned sequence.
     * @param comparer An IAsyncEqualityComparer<T> to compare values.
     * @returns A sequence that contains the set difference of the elements of two sequences.
     */
    ExceptAsync(second: Iterable<TSource>, comparer: IAsyncEqualityComparer<TSource>): IAsyncEnumerable<TSource>

    /**
     * Returns first element in sequence that satisfies predicate otherwise
     * returns the first element in the sequence.
     * @param predicate A function to test each element for a condition. Optional.
     * @throws {import('../types/InvalidOperationException')} No elements in Iteration matching predicate
     * @returns The first element in the sequence
     * or the first element that passes the test in the specified predicate function.
     */
    First(predicate?: (x: TSource) => boolean): TSource

    /**
     * Returns the first element in a sequence that satisfies a specified condition.
     * @param predicate A function to test each element for a condition.
     * @throws {import('../types/InvalidOperationException')} No elements in Iteration matching predicate
     * @returns The first element in the sequence that passes the test in the specified predicate function.
     */
    FirstAsync(predicate: (x: TSource) => Promise<boolean>): Promise<TSource>

    /**
     * Returns first element in sequence that satisfies predicate otherwise
     * returns the first element in the sequence. Returns null if no value found.
     * @param predicate A function to test each element for a condition. Optional.
     * @returns The first element in the sequence
     * or the first element that passes the test in the specified predicate function.
     * Returns null if no value found.
     */
    FirstOrDefault(predicate?: (x: TSource) => boolean): TSource | null

    /**
     * Returns the first element of the sequence that satisfies a condition or a default value
     * if no such element is found.
     * @param predicate An async function to test each element for a condition.
     * @returns null if source is empty or if no element passes the test specified by predicate;
     * otherwise, the first element in source that passes the test specified by predicate.
     */
    FirstOrDefaultAsync(predicate: (x: TSource) => Promise<boolean>): Promise<TSource | null>

    /**
     * Groups the elements of a sequence according to a specified key selector function.
     * @param keySelector A function to extract the key for each element.
     * @returns An IEnumerable<IGrouping<TKey, TSource>>
     * where each IGrouping<TKey,TElement> object contains a sequence of objects and a key.
     */
    GroupBy<TKey extends SelectorKeyType>(
        keySelector: (x: TSource) => TKey): IEnumerable<IGrouping<TKey, TSource>>

    /**
     * Groups the elements of a sequence according to a key selector function.
     * The keys are compared by using a comparer and each group's elements are projected by using a specified function.
     * @param keySelector A function to extract the key for each element.
     * @param comparer An IEqualityComparer<T> to compare keys.
     * @returns An IEnumerable<IGrouping<TKey, TSource>>
     * where each IGrouping<TKey,TElement> object contains a sequence of objects and a key.
     */
    GroupBy<TKey>(
        keySelector: (x: TSource) => TKey,
        comparer: IEqualityComparer<TKey>): IEnumerable<IGrouping<TKey, TSource>>

    /**
     * Groups the elements of a sequence according to a specified key selector function.
     * @param keySelector An async function to extract the key for each element.
     * @returns An IAsyncEnumerable<IGrouping<TKey, TSource>>
     * where each IGrouping<TKey,TElement> object contains a sequence of objects and a key.
     */
    GroupByAsync<TKey extends SelectorKeyType>(
        keySelector: (x: TSource) => Promise<TKey>): IAsyncEnumerable<IGrouping<TKey, TSource>>

    /**
     * Groups the elements of a sequence according to a specified key selector function.
     * @param keySelector A function to extract the key for each element.
     * @param comparer An IEqualityComparer<T> or IAsyncEqualityComparer<T> to compare keys.
     * @returns An IAsyncEnumerable<IGrouping<TKey, TSource>>
     * where each IGrouping<TKey,TElement> object contains a sequence of objects and a key.
     */
    GroupByAsync<TKey>(
        keySelector: (x: TSource) => Promise<TKey> | TKey,
        comparer: IEqualityComparer<TKey> | IAsyncEqualityComparer<TKey>)
        : IAsyncEnumerable<IGrouping<TKey, TSource>>

    /**
     * Groups the elements of a sequence according to a specified key selector function and
     * projects the elements for each group by using a specified function.
     * @param keySelector A function to extract the key for each element.
     * @param elementSelector A function to map each source element to an element in an IGrouping<TKey,TElement>.
     * @returns An IEnumerable<IGrouping<TKey, TElement>>
     * where each IGrouping<TKey,TElement> object contains a collection of objects of type TElement and a key.
     */
    GroupByWithSel<TElement, TKey extends SelectorKeyType>(
        keySelector: ((x: TSource) => TKey),
        elementSelector: (x: TSource) => TElement): IEnumerable<IGrouping<TKey, TElement>>

    /**
     * Groups the elements of a sequence according to a key selector function.
     * The keys are compared by using a comparer and each group's elements are projected by using a specified function.
     * @param keySelector A function to extract the key for each element.
     * @param elementSelector A function to map each source element to an element in an IGrouping<TKey,TElement>.
     * @param comparer An IEqualityComparer<T> to compare keys.
     * @returns An IEnumerable<IGrouping<TKey,TElement>>
     * where each IGrouping<TKey,TElement> object contains a collection of objects of type TElement and a key.
     */
    GroupByWithSel<TKey, TElement>(
        keySelector: ((x: TSource) => TKey),
        elementSelector: (x: TSource) => TElement,
        comparer: IEqualityComparer<TKey>): IEnumerable<IGrouping<TKey, TElement>>

    /**
     * Produces the set intersection of two sequences by using the specified IEqualityComparer<T> to compare values.
     * If no comparer is selected, uses the StrictEqualityComparer.
     * @param second An Iterable<T> whose distinct elements that also appear in the first sequence will be returned.
     * @param comparer An IEqualityComparer<T> to compare values. Optional.
     * @returns A sequence that contains the elements that form the set intersection of two sequences.
     */
    Intersect(second: IEnumerable<TSource>, comparer?: IEqualityComparer<TSource>): IEnumerable<TSource>

    /**
     * Produces the set intersection of two sequences by using the specified
     * IAsyncEqualityComparer<T> to compare values.
     * @param second An Iterable<T> whose distinct elements that also appear in the first sequence will be returned.
     * @param comparer An IAsyncEqualityComparer<T> to compare values.
     * @returns A sequence that contains the elements that form the set intersection of two sequences.
     */
    IntersectAsync(
        second: IEnumerable<TSource>,
        comparer: IAsyncEqualityComparer<TSource>): IAsyncEnumerable<TSource>

    /**
     * Correlates the elements of two sequences based on matching keys.
     * A specified IEqualityComparer<T> is used to compare keys or the strict equality comparer.
     * @param inner The sequence to join to the first sequence.
     * @param outerKeySelector A function to extract the join key from each element of the first sequence.
     * @param innerKeySelector A function to extract the join key from each element of the second sequence.
     * @param resultSelector A function to create a result element from two matching elements.
     * @param comparer An IEqualityComparer<T> to hash and compare keys. Optional.
     * @returns An IEnumerable<T> that has elements of type TResult that
     * are obtained by performing an inner join on two sequences.
     */
    JoinByKey<TInner, TKey, TResult>(
        inner: IEnumerable<TInner>,
        outerKeySelector: (x: TSource) => TKey,
        innerKeySelector: (x: TInner) => TKey,
        resultSelector: (x: TSource, y: TInner) => TResult,
        comparer?: IEqualityComparer<TKey>): IEnumerable<TResult>

    /**
     * Returns the last element of a sequence.
     * If predicate is specified, the last element of a sequence that satisfies a specified condition.
     * @param predicate A function to test each element for a condition. Optional.
     * @throws {import('../types/InvalidOperationException')} The source sequence is empty.
     * @returns The value at the last position in the source sequence
     * or the last element in the sequence that passes the test in the specified predicate function.
     */
    Last(predicate?: (x: TSource) => boolean): TSource

    /**
     * Returns the last element of a sequence that satisfies a specified condition.
     * @param predicate A function to test each element for a condition.
     * @throws {import('../types/InvalidOperationException')} The source sequence is empty.
     * @returns The last element in the sequence that passes the test in the specified predicate function.
     */
    LastAsync(predicate: (x: TSource) => Promise<boolean>): Promise<TSource>

    /**
     * Returns the last element of a sequence.
     * If predicate is specified, the last element of a sequence that satisfies a specified condition.
     * @param predicate A function to test each element for a condition. Optional.
     * @returns The value at the last position in the source sequence
     * or the last element in the sequence that passes the test in the specified predicate function.
     */
    LastOrDefault(predicate?: (x: TSource) => boolean): TSource | null

    /**
     * Returns the last element of a sequence that satisfies a specified condition.
     * @param predicate A function to test each element for a condition.
     * @returns The last element in the sequence that passes the test in the specified predicate function.
     * Null if no elements.
     */
    LastOrDefaultAsync(predicate: (x: TSource) => Promise<boolean>): Promise<TSource | null>

    /**
     * Returns the maximum value in a sequence of values.
     * @throws {import('../types/InvalidOperationException')} source contains no elements.
     * @returns The maximum value in the sequence.
     */
    Max(this: IEnumerable<number>): number

    /**
     * Invokes a transform function on each element of a sequence and returns the maximum value.
     * @param selector A transform function to apply to each element.
     * @throws {import('../types/InvalidOperationException')} source contains no elements.
     * @returns The maximum value in the sequence.
     */
    Max(selector: (x: TSource) => number): number

    /**
     * Invokes an async transform function on each element of a sequence and returns the maximum value.
     * @param selector A transform function to apply to each element.
     * @throws {import('../types/InvalidOperationException')} source contains no elements.
     * @returns The maximum value in the sequence.
     */
    MaxAsync(selector: (x: TSource) => Promise<number>): Promise<number>

    /**
     * Returns the minimum value in a sequence of values.
     * @throws {import('../types/InvalidOperationException')} source contains no elements.
     * @returns The minimum value in the sequence.
     */
    Min(this: IEnumerable<number>): number

    /**
     * Invokes a transform function on each element of a sequence and returns the minimum value.
     * @param selector A transform function to apply to each element.
     * @throws {import('../types/InvalidOperationException')} source contains no elements.
     * @returns The minimum value in the sequence.
     */
    Min(selector: (x: TSource) => number): number

    /**
     * Invokes a transform function on each element of a sequence and returns the minimum value.
     * @param selector A transform function to apply to each element.
     * @throws {import('../types/InvalidOperationException')} source contains no elements.
     * @returns The minimum value in the sequence.
     */
    MinAsync(selector: (x: TSource) => Promise<number>): Promise<number>

    /**
     * Applies a type filter to a source iteration
     * @param type Either value for typeof or a consturctor function
     * @returns Values that match the type string or are instance of type
     */
    OfType<T extends OfType>(type: T): IEnumerable<InferType<T>>

    /**
     * Sorts the elements of a sequence in ascending order by using a specified or default comparer.
     * @param keySelector A function to extract a key from an element.
     * @param comparer An IComparer<T> to compare keys. Optional.
     * @returns An IOrderedEnumerable<TElement> whose elements are sorted according to a key.
     */
    OrderBy<TKey>(
        predicate: (x: TSource) => TKey,
        comparer?: IComparer<TKey>): IOrderedEnumerable<TSource>

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
     * @returns An IOrderedEnumerable<TElement> whose elements are sorted in descending order according to a key.
     */
    OrderByDescending<TKey>(
        predicate: (x: TSource) => TKey,
        comparer?: IComparer<TKey>): IOrderedEnumerable<TSource>

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
     * Partitions the values into a tuple of failing and passing arrays
     * @param predicate Predicate to determine whether a value passes or fails
     * @returns [values that pass, values that fail]
     */
    Partition(predicate: (x: TSource) => boolean): [pass: TSource[], fail: TSource[]]

    /**
     * Partitions the values into a tuple of failing and passing arrays
     * @param predicate Predicate to determine whether a value passes or fails
     * @returns [values that pass, values that fail]
     */
    PartitionAsync(predicate: (x: TSource) => Promise<boolean>): Promise<[pass: TSource[], fail: TSource[]]>

    /**
     * Inverts the order of the elements in a sequence.
     * @returns A sequence whose elements correspond to those of the input sequence in reverse order.
     */
    Reverse(): IEnumerable<TSource>

    /**
     * Projects each element of a sequence into a new form.
     * @param selector A transform function to apply to each element.
     * @returns
     * An IEnumerable<T> whose elements are the result of invoking the transform function on each element of source.
     */
    Select<TResult>(selector: (x: TSource, index: number) => TResult): IEnumerable<TResult>

    /**
     * Projects each element of a sequence into a new form.
     * @param selector A key of TSource.
     * @returns
     * An IEnumerable<T> whose elements are the result of getting the value from the key on each element of source.
     */
    Select<TKey extends keyof TSource>(key: TKey): IEnumerable<TSource[TKey]>

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
        this: IEnumerable<{ [key: string]: Promise<TResult> }>,
        key: TKey): IAsyncEnumerable<TResult>

    /**
     * Projects each element of a sequence to an IEnumerable<T> and flattens the resulting sequences into one sequence.
     * @param selector A transform function to apply to each element.
     * @returns An IEnumerable<T> whose elements are the result of invoking the
     * one-to-many transform function on each element of the input sequence.
     */
    SelectMany<TResult>(selector: (x: TSource, index: number) => Iterable<TResult>): IEnumerable<TResult>

    /**
     * Projects each element of a sequence to an IEnumerable<T> and flattens the resulting sequences into one sequence.
     * @param selector A string key of TSource.
     * @returns An IEnumerable<T> whose elements are the result of invoking the
     * parameter the key is tried to on each element of the input sequence.
     */
    SelectMany<TBindedSource extends { [key: string]: Iterable<TOut> }, TOut>(
        this: IEnumerable<TBindedSource>,
        selector: keyof TBindedSource): IEnumerable<TOut>

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
    SequenceEquals(second: IEnumerable<TSource>, comparer?: IEqualityComparer<TSource>): boolean

    /**
     * Compares two sequences to see if they are equal using an async comparer function.
     * @param second Second Sequence
     * @param comparer Async Comparer
     * @returns Whether or not the two iterations are equal
     */
    SequenceEqualsAsync(second: IEnumerable<TSource>, comparer: IAsyncEqualityComparer<TSource>): Promise<boolean>

    /**
     * Returns the only element of a sequence that satisfies a specified condition (if specified),
     * and throws an exception if more than one such element exists.
     * @param predicate A function to test an element for a condition. (Optional)
     * @throws {import('../types/InvalidOperationException')} No element satisfies the condition in predicate. OR
     * More than one element satisfies the condition in predicate. OR
     * The source sequence is empty.
     * @returns The single element of the input sequence that satisfies a condition.
     */
    Single(predicate?: (x: TSource) => boolean): TSource

    /**
     * Returns the only element of a sequence that satisfies a specified condition,
     * and throws an exception if more than one such element exists.
     * @param predicate A function to test an element for a condition.
     * @throws {import('../types/InvalidOperationException')}
     * No element satisfies the condition in predicate. OR
     * More than one element satisfies the condition in predicate. OR
     * The source sequence is empty.
     * @returns The single element of the input sequence that satisfies a condition.
     */
    SingleAsync(predicate: (x: TSource) => Promise<boolean>): Promise<TSource>

    /**
     * If predicate is specified returns the only element of a sequence that satisfies a specified condition,
     * ootherwise returns the only element of a sequence. Returns a default value if no such element exists.
     * @param predicate A function to test an element for a condition. Optional.
     * @throws {import('../types/InvalidOperationException')}
     * If predicate is specified more than one element satisfies the condition in predicate,
     * otherwise the input sequence contains more than one element.
     * @returns The single element of the input sequence that satisfies the condition,
     * or null if no such element is found.
     */
    SingleOrDefault(predicate?: (x: TSource) => boolean): TSource | null

    /**
     * Returns the only element of a sequence that satisfies a specified condition.
     * Returns a default value if no such element exists.
     * @param predicate A function to test an element for a condition. Optional.
     * @throws {import('../types/InvalidOperationException')}
     * If predicate is specified more than one element satisfies the condition in predicate,
     * otherwise the input sequence contains more than one element.
     * @returns The single element of the input sequence that satisfies the condition,
     * or null if no such element is found.
     */
    SingleOrDefaultAsync(predicate: (x: TSource) => Promise<boolean>): Promise<TSource | null>

    /**
     * Bypasses a specified number of elements in a sequence and then returns the remaining elements.
     * @param count The number of elements to skip before returning the remaining elements.
     * @returns An IEnumerable<T> that contains the elements that occur after the specified index in the input sequence.
     */
    Skip(count: number): IEnumerable<TSource>

    /**
     * Bypasses elements in a sequence as long as a specified condition is true and then returns the remaining elements.
     * The element's index is used in the logic of the predicate function.
     * @param predicate A function to test each source element for a condition;
     * the second parameter of the function represents the index of the source element.
     * @returns An IEnumerable<T> that contains the elements from the input sequence starting at the first element
     * in the linear series that does not pass the test specified by predicate.
     */
    SkipWhile(predicate: (x: TSource, index: number) => boolean): IEnumerable<TSource>

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
     * Computes the sum of the sequence of numeric values.
     * @returns The sum of the values in the sequence.
     */
    Sum(this: IEnumerable<number>): number

    /**
     * Computes the sum of the sequence of numeric values that are obtained by invoking a transform function
     * on each element of the input sequence.
     * @param selector A transform function to apply to each element.
     * @returns The sum of the projected values.
     */
    Sum(selector: (x: TSource) => number): number

    /**
     * Computes the sum of the sequence of numeric values that are obtained by invoking a transform function
     * on each element of the input sequence.
     * @param selector An async transform function to apply to each element.
     * @returns The sum of the projected values.
     */
    SumAsync(selector: (x: TSource) => Promise<number>): Promise<number>

    /**
     * Returns a specified number of contiguous elements from the start of a sequence.
     * @param amount The number of elements to return.
     * @returns An IEnumerable<T> that contains the specified number of elements from the start of the input sequence.
     */
    Take(amount: number): IEnumerable<TSource>

    /**
     * Returns elements from a sequence as long as a specified condition is true.
     * The element's index is used in the logic of the predicate function.
     * @param predicate A function to test each source element for a condition;
     * the second parameter of the function represents the index of the source element.
     * @returns An IEnumerable<T> that contains elements from the input sequence
     * that occur before the element at which the test no longer passes.
     */
    TakeWhile(predicate: (x: TSource, index: number) => boolean): IEnumerable<TSource>

    /**
     * Returns elements from a sequence as long as a specified condition is true.
     * The element's index is used in the logic of the predicate function.
     * @param predicate A async function to test each source element for a condition;
     * the second parameter of the function represents the index of the source element.
     * @returns An IAsyncEnumerable<T> that contains elements from the input sequence
     * that occur before the element at which the test no longer passes.
     */
    TakeWhileAsync(predicate: (x: TSource, index: number) => Promise<boolean>): IAsyncEnumerable<TSource>

    /**
     * Creates an array from a IEnumerable<T>.
     * @returns An array of elements
     */
    ToArray(): TSource[]

    ToList(): IList<TSource>

    /**
     * Converts an Iterable<V> to a Map<K, V[]>.
     * @param selector A function to serve as a key selector.
     * @returns Map<K, V[]>
     */
    ToMap<TKey>(selector: (x: TSource) => TKey): Map<TKey, TSource[]>

    /**
     * Converts an Iterable<V> to a Map<K, V[]>.
     * @param selector An async function to serve as a key selector.
     * @returns A promise for Map<K, V[]>
     */
    ToMapAsync<TKey>(selector: (x: TSource) => Promise<TKey>): Promise<Map<TKey, TSource[]>>

    /**
     * Converts the Iteration to an Object. Duplicate values will be overriden.
     * @param selector A function to determine the Key based on the value.
     * @returns KVP Object
     */
    ToObject<TKey extends keyof any>(selector: (x: TSource) => TKey): Record<TKey, TSource>

    /**
     * Converts the Iteration to an Object. Duplicate values will be overriden.
     * @param selector An async function to determine the Key based on the value.
     * @returns KVP Object
     */
    ToObjectAsync<TKey extends keyof any>(selector: (x: TSource) => Promise<TKey>): Promise<Record<TKey, TSource>>

    /**
     * Converts the iteration to a Set
     * @returns Set containing the iteration values
     */
    ToSet(): Set<TSource>

    /**
     * Produces the set union of two sequences by using scrict equality comparison or a specified IEqualityComparer<T>.
     * @param second An Iterable<T> whose distinct elements form the second set for the union.
     * @param comparer The IEqualityComparer<T> to compare values. Optional.
     * @returns An IEnumerable<T> that contains the elements from both input sequences, excluding duplicates.
     */
    Union(second: Iterable<TSource>, comparer?: IEqualityComparer<TSource>): IEnumerable<TSource>

    /**
     * Produces the set union of two sequences by using a specified IAsyncEqualityComparer<T>.
     * @param second An Iterable<T> whose distinct elements form the second set for the union.
     * @param comparer The IAsyncEqualityComparer<T> to compare values.
     * @returns An IAsyncEnumerable<T> that contains the elements from both input sequences, excluding duplicates.
     */
    UnionAsync(second: Iterable<TSource>, comparer: IAsyncEqualityComparer<TSource>): IAsyncEnumerable<TSource>

    /**
     * Filters a sequence of values based on a predicate.
     * Each element's index is used in the logic of the predicate function.
     * @param predicate A function to test each source element for a condition;
     * the second parameter of the function represents the index of the source element.
     * @returns An IEnumerable<T> that contains elements from the input sequence that satisfy the condition.
     */
    Where(predicate: (x: TSource, index: number) => boolean): IEnumerable<TSource>

    /**
     * Filters a sequence of values based on a predicate.
     * Each element's index is used in the logic of the predicate function.
     * @param predicate A async function to test each source element for a condition;
     * the second parameter of the function represents the index of the source element.
     * @returns An IAsyncEnumerable<T> that contains elements from the input sequence that satisfy the condition.
     */
    WhereAsync(predicate: (x: TSource, index: number) => Promise<boolean>): IAsyncEnumerable<TSource>

    /**
     * Creates a tuple of corresponding elements of two sequences, producing a sequence of the results.
     * @param second The second sequence to merge.
     * @returns An IEnumerable<[T, Y]> that contains merged elements of two input sequences.
     */
    Zip<TSecond>(second: Iterable<TSecond>): IEnumerable<[TSource, TSecond]>

    /**
     * Applies a specified function to the corresponding elements of two sequences, producing a sequence of the results.
     * @param second The second sequence to merge.
     * @param resultSelector A function that specifies how to merge the elements from the two sequences.
     * @returns An IEnumerable<TResult> that contains merged elements of two input sequences.
     */
    Zip<TSecond, TResult>(
        second: Iterable<TSecond>,
        resultSelector: (x: TSource, y: TSecond) => TResult): IEnumerable<TResult>

    /**
     * Applies a specified async function to the corresponding elements of two sequences,
     * producing a sequence of the results.
     * @param second The second sequence to merge.
     * @param resultSelector An async function that specifies how to merge the elements from the two sequences.
     * @returns An IAsyncEnumerable<T> that contains merged elements of two input sequences.
     */
    ZipAsync<TSecond, TResult>(
        second: Iterable<TSecond>,
        resultSelector: (x: TSource, y: TSecond) => Promise<TResult>): IAsyncEnumerable<TResult>

    [Symbol.iterator](): IterableIterator<TSource>
}
