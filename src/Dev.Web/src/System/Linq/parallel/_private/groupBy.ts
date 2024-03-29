import {Grouping} from "../../sync/Grouping"
import {
    IAsyncParallel, IEqualityComparer, IGrouping, IParallelEnumerable,
    ParallelGeneratorType, SelectorKeyType
} from "../../types"
import {BasicParallelEnumerable} from "../BasicParallelEnumerable"

type GroupByFunc = {
    /**
     * Groups the elements of a sequence according to a specified key selector function.
     * @param source An IAsyncParallel<T> whose elements to group.
     * @param keySelector A function to extract the key for each element.
     * @returns An IParallelEnumerable<IGrouping<TKey, TSource>>
     * where each IGrouping<TKey,TElement> object contains a sequence of objects and a key.
     */<TSource, TKey extends SelectorKeyType>(
        source: IAsyncParallel<TSource>,
        keySelector: (x: TSource) => TKey): IParallelEnumerable<IGrouping<TKey, TSource>>
    /**
     * Groups the elements of a sequence according to a key selector function.
     * The keys are compared by using a comparer and each group's elements are projected by using a specified function.
     * @param source An IAsyncParallel<T> whose elements to group.
     * @param keySelector A function to extract the key for each element.
     * @param comparer An IEqualityComparer<T> to compare keys.
     */<TSource, TKey>(
        source: IAsyncParallel<TSource>,
        keySelector: (x: TSource) => TKey,
        comparer: IEqualityComparer<TKey>): IParallelEnumerable<IGrouping<TKey, TSource>>
}


export const groupBy: GroupByFunc = <TSource, TKey>(
    source: IAsyncParallel<TSource>,
    keySelector: (x: TSource) => TKey,
    comparer?: IEqualityComparer<TKey>): IParallelEnumerable<IGrouping<TKey, TSource>> => {

    if (comparer) {
        return groupBy_0<TSource, TKey>(source,
            keySelector as (x: TSource) => TKey, comparer)
    } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return groupBy_0_Simple(source,
            keySelector as (x: TSource) => any)
    }
}

const groupBy_0_Simple = <TSource, TKey extends SelectorKeyType>(
    source: IAsyncParallel<TSource>,
    keySelector: (x: TSource) => TKey):
    IParallelEnumerable<IGrouping<TKey, TSource>> => {

    const generator = async () => {
        const keyMap: { [key: string]: Grouping<TKey, TSource> } = {}
        for (const value of await source.ToArray()) {

            const key = keySelector(value)
            const grouping: Grouping<TKey, TSource> = keyMap[key] // TODO

            if (grouping) {
                grouping.push(value)
            } else {
                keyMap[key] = new Grouping<TKey, TSource>(key, value)
            }
        }

        const results = new Array<IGrouping<TKey, TSource>>()
        /* eslint-disable guard-for-in */
        for (const value in keyMap) {
            results.push(keyMap[value])
        }
        /* eslint-enable guard-for-in */
        return results
    }

    return new BasicParallelEnumerable({
        generator,
        type: ParallelGeneratorType.PromiseToArray,
    })
}

const groupBy_0 = <TSource, TKey>(
    source: IAsyncParallel<TSource>,
    keySelector: (x: TSource) => TKey,
    comparer: IEqualityComparer<TKey>): IParallelEnumerable<IGrouping<TKey, TSource>> => {

    const generator = async () => {

        const keyMap = new Array<Grouping<TKey, TSource>>()

        for (const value of await source.ToArray()) {
            const key = keySelector(value)
            let found = false

            for (let i = 0; i < keyMap.length; i++) {
                const group = keyMap[i]
                if (comparer(group.key, key)) {
                    group.push(value)
                    found = true
                    break
                }
            }

            if (found === false) {
                keyMap.push(new Grouping<TKey, TSource>(key, value))
            }

        }

        const results = new Array<Grouping<TKey, TSource>>()
        for (const g of keyMap) {
            results.push(g)
        }
        return results as IGrouping<TKey, TSource>[]
    }

    return new BasicParallelEnumerable({
        generator,
        type: ParallelGeneratorType.PromiseToArray,
    })
}
