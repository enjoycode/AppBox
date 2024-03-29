/**
 * Returns the first element of the sequence that satisfies a condition or a default value if no such element is found.
 * @param source An Iterable<T> to return an element from.
 * @param predicate An async function to test each element for a condition.
 * @returns null if source is empty or if no element passes the test specified by predicate;
 * otherwise, the first element in source that passes the test specified by predicate.
 */
export const firstOrDefaultAsync = async <TSource>(
    source: Iterable<TSource>, predicate: (x: TSource) => Promise<boolean>): Promise<TSource | null> => {
    for (const value of source) {
        if (await predicate(value) === true) {
            return value
        }
    }

    return null
}
