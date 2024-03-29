import {IAsyncEqualityComparer} from "../../types/IAsyncEqualityComparer"

/**
 * Determines whether a sequence contains a specified element by using the specified or default IEqualityComparer<T>.
 * @param source A sequence in which to locate a value.
 * @param value The value to locate in the sequence.
 * @param comparer An equality comparer to compare values. Optional.
 * @returns Whether or not the async sequence contains the specified value
 */
export const containsAsync = async <TSource>(
    source: AsyncIterable<TSource>,
    value: TSource,
    comparer: IAsyncEqualityComparer<TSource>): Promise<boolean> => {

    for await (const item of source) {
        if (await comparer(value, item)) {
            return true
        }
    }

    return false
}
