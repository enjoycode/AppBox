import {IEnumerable} from "../../types"
import {BasicEnumerable} from "../BasicEnumerable"

/**
 * Filters a sequence of values based on a predicate.
 * Each element's index is used in the logic of the predicate function.
 * @param source An Iterable<T> to filter.
 * @param predicate A function to test each source element for a condition;
 * the second parameter of the function represents the index of the source element.
 * @returns An IEnumerable<T> that contains elements from the input sequence that satisfy the condition.
 */
export const where = <TSource>(
    source: Iterable<TSource>,
    predicate: (x: TSource, index: number) => boolean): IEnumerable<TSource> => {
    if (predicate.length === 1) {
        return where1(source, predicate as (x: TSource) => boolean)
    } else {
        return where2(source, predicate as (x: TSource, index: number) => boolean)
    }
}

const where1 = <T>(source: Iterable<T>, predicate: (x: T) => boolean): IEnumerable<T> => {
    function* iterator() {
        for (const item of source) {
            if (predicate(item) === true) {
                yield item
            }
        }
    }

    return new BasicEnumerable<T>(iterator)
}

const where2 = <T>(source: Iterable<T>, predicate: (x: T, index: number) => boolean): IEnumerable<T> => {
    function* iterator() {
        let i = 0
        for (const item of source) {
            if (predicate(item, i++) === true) {
                yield item
            }
        }
    }

    return new BasicEnumerable<T>(iterator)
}
