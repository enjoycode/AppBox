import {IParallelEnumerable, ParallelGeneratorType} from "../../types"
import {ArgumentOutOfRangeException} from "../../../Exceptions";

/**
 * Returns the element at a specified index in a sequence.
 * @param source An IEnumerable<T> to return an element from.
 * @param index The zero-based index of the element to retrieve.
 * @throws {ArgumentOutOfRangeException}
 * index is less than 0 or greater than or equal to the number of elements in source.
 * @returns The element at the specified index in the sequence.
 */
export const elementAt = async <TSource>(
    source: IParallelEnumerable<TSource>,
    index: number): Promise<TSource> => {
    if (index < 0) {
        throw new ArgumentOutOfRangeException("index")
    }

    const dataFunc = source.dataFunc

    switch (dataFunc.type) {
        case ParallelGeneratorType.PromiseToArray: {
            const values = await dataFunc.generator()
            if (index >= values.length) {
                throw new ArgumentOutOfRangeException("index")
            } else {
                return values[index]
            }
        }
        case ParallelGeneratorType.ArrayOfPromises: {
            const promises = dataFunc.generator()

            if (index >= promises.length) {
                throw new ArgumentOutOfRangeException("index")
            } else {
                return await promises[index]
            }
        }
        case ParallelGeneratorType.PromiseOfPromises: {
            const promises = await dataFunc.generator()
            if (index >= promises.length) {
                throw new ArgumentOutOfRangeException("index")
            } else {
                return await promises[index]
            }
        }
    }
}
