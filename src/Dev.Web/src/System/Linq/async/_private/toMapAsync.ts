/**
 * Converts an AsyncIterable<V> to a Map<K, V[]>.
 * @param source An Iterable<V> to convert.
 * @param selector An async function to serve as a key selector.
 * @returns A promise for Map<K, V[]>
 */
export const toMapAsync = async <K, V>(
    source: AsyncIterable<V>,
    selector: (x: V) => Promise<K>): Promise<Map<K, V[]>> => {
    const map = new Map<K, V[]>()

    for await (const value of source) {
        const key = await selector(value)
        const array = map.get(key)

        if (array === undefined) {
            map.set(key, [value])
        } else {
            array.push(value)
        }
    }

    return map
}
