/**
 * Paritions the AsyncIterable<T> into a tuple of failing and passing arrays
 * based on the predicate.
 * @param source Elements to Partition
 * @param predicate Pass / Fail condition
 * @returns [pass, fail]
 */
export const partition = async <TSource>(
    source: AsyncIterable<TSource>, predicate: (x: TSource) => boolean): Promise<[pass: TSource[], fail: TSource[]]> => {
    const fail: TSource[] = []
    const pass: TSource[] = []

    for await (const value of source) {
        if (predicate(value) === true) {
            pass.push(value)
        } else {
            fail.push(value)
        }
    }

    return [pass, fail]
}
