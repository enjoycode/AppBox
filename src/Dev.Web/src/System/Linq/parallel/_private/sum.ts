import {IAsyncParallel} from "../../types"

type SumFunc = {
    /**
     * Computes the sum of a sequence of values.
     * @param source A sequence of values to calculate the sum of.
     * @returns The sum of the values in the sequence.
     */
    (source: IAsyncParallel<number>): Promise<number>
    /**
     * Computes the sum of the sequence of values
     * that are obtained by invoking a transform function on each element of the input sequence.
     * @param source A sequence of values that are used to calculate a sum.
     * @param selector A transform function to apply to each element.
     * @returns The sum of the projected values.
     */<TSource>(
        source: IAsyncParallel<TSource>,
        selector: (x: TSource) => number): Promise<number>
}


export const sum: SumFunc = <TSource>(
    source: IAsyncParallel<TSource> | IAsyncParallel<number>,
    selector?: (x: TSource) => number): Promise<number> => {

    if (selector) {
        return sum2(source as IAsyncParallel<TSource>, selector)
    } else {
        return sum1(source as IAsyncParallel<number>)
    }
}

const sum1 = async (
    source: IAsyncParallel<number>): Promise<number> => {
    let totalSum = 0
    for (const value of await source.ToArray()) {
        totalSum += value
    }

    return totalSum
}

const sum2 = async <TSource>(
    source: IAsyncParallel<TSource>, selector: (x: TSource) => number): Promise<number> => {
    let total = 0
    for (const value of await source.ToArray()) {
        total += selector(value)
    }

    return total
}
