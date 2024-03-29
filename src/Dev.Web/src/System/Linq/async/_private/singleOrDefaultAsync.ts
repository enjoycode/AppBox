import {ErrorString} from "../../shared"
import {InvalidOperationException} from "../../../Exceptions";

/**
 * Returns the only element of a sequence that satisfies a specified condition.
 * Returns a default value if no such element exists.
 * @param source An AsyncIterable<T> to return a single element from.
 * @param predicate A function to test an element for a condition. Optional.
 * @throws {InvalidOperationException}
 * If predicate is specified more than one element satisfies the condition in predicate,
 * otherwise the input sequence contains more than one element.
 * @returns The single element of the input sequence that satisfies the condition,
 * or null if no such element is found.
 */
export const singleOrDefaultAsync = async <TSource>(
    source: AsyncIterable<TSource>,
    predicate: (x: TSource) => Promise<boolean>): Promise<TSource | null> => {

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

    return singleValue
}
