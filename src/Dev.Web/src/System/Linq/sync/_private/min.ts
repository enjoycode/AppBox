import {ErrorString} from "../../shared"
import {InvalidOperationException} from "../../../Exceptions";

type MinFunc = {
    /**
     * Returns the minimum value in a sequence of values.
     * @param source A sequence of values to determine the minimum value of.
     * @throws {InvalidOperationException} source contains no elements.
     * @returns The minimum value in the sequence.
     */
    (source: Iterable<number>): number
    /**
     * Invokes a transform function on each element of a sequence and returns the minimum value.
     * @param source A sequence of values to determine the minimum value of.
     * @param selector A transform function to apply to each element.
     * @throws {InvalidOperationException} source contains no elements.
     * @returns The minimum value in the sequence.
     */<TSource>(source: Iterable<TSource>, selector: (x: TSource) => number): number
}

export const min: MinFunc = <TSource>(source: Iterable<TSource> | Iterable<number>,
                                      selector?: (x: TSource) => number): number => {
    if (selector) {
        return min2(source as Iterable<TSource>, selector)
    } else {
        return min1(source as Iterable<number>)
    }
}

const min1 = (source: Iterable<number>) => {
    let minItem: number | null = null
    for (const item of source) {
        minItem = Math.min(minItem || Number.POSITIVE_INFINITY, item)
    }

    if (minItem === null) {
        throw new InvalidOperationException(ErrorString.NoElements)
    } else {
        return minItem
    }
}

const min2 = <TSource>(source: Iterable<TSource>, selector: (x: TSource) => number) => {
    let minItem: number | null = null
    for (const item of source) {
        minItem = Math.min(minItem || Number.POSITIVE_INFINITY, selector(item))
    }

    if (minItem === null) {
        throw new InvalidOperationException(ErrorString.NoElements)
    } else {
        return minItem
    }
}
