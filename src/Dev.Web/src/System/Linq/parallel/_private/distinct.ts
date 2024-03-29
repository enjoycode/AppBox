import {StrictEqualityComparer} from "../../shared"
import {IAsyncParallel, IEqualityComparer, IParallelEnumerable, ParallelGeneratorType} from "../../types"
import {BasicParallelEnumerable} from "../BasicParallelEnumerable"

/**
 * Returns distinct elements from a sequence by using the default or specified equality comparer to compare values.
 * @param source The sequence to remove duplicate elements from.
 * @param comparer An IEqualityComparer<T> to compare values. Optional. Defaults to Strict Equality Comparison.
 * @returns An IParallelEnumerable<T> that contains distinct elements from the source sequence.
 */
export const distinct = <TSource>(
    source: IAsyncParallel<TSource>,
    comparer: IEqualityComparer<TSource> = StrictEqualityComparer): IParallelEnumerable<TSource> => {
    const generator = async () => {
        const distinctElements: TSource[] = []
        for (const item of await source.ToArray()) {
            const foundItem = distinctElements.find((x) => comparer(x, item))
            if (!foundItem) {
                distinctElements.push(item)
            }
        }
        return distinctElements
    }

    return new BasicParallelEnumerable({
        generator,
        type: ParallelGeneratorType.PromiseToArray,
    })
}
