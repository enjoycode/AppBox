import {ErrorString} from "../../shared"
import {InvalidOperationException} from "../../../Exceptions";

/**
 * Returns the only element of a sequence that satisfies a specified condition,
 * and throws an exception if more than one such element exists.
 * @param source An AsyncIterable<T> to return a single element from.
 * @param predicate A function to test an element for a condition.
 * @throws {InvalidOperationException}
 * No element satisfies the condition in predicate. OR
 * More than one element satisfies the condition in predicate. OR
 * The source sequence is empty.
 * @returns The single element of the input sequence that satisfies a condition.
 */
export const singleAsync = async <TSource>(
    source: AsyncIterable<TSource>,
    predicate: (x: TSource) => Promise<boolean>): Promise<TSource> => {
    let hasValue = false
    let singleValue: TSource | null = null

    for await (const value of source) {
        if (await predicate(value)) {
            if (hasValue === true) {
                throw new InvalidOperationException(ErrorString.MoreThanOneMatchingElement)
            } else {
                hasValue = true
                singleValue = value
            }
        }
    }

    if (hasValue === false) {
        throw new InvalidOperationException(ErrorString.NoMatch)
    }

    return singleValue as TSource
}
