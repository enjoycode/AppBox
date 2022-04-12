import {IAsyncEnumerable, IPrototype} from "../types"

import {aggregate} from "./../async/_private/aggregate"
import {all} from "./../async/_private/all"
import {allAsync} from "./../async/_private/allAsync"
import {any} from "./../async/_private/any"
import {anyAsync} from "./../async/_private/anyAsync"
import {asParallel} from "./../async/_private/asParallel"
import {average} from "./../async/_private/average"
import {averageAsync} from "./../async/_private/averageAsync"
import {concatenate} from "../async/_private/concatenate"
import {contains} from "./../async/_private/contains"
import {containsAsync} from "./../async/_private/containsAsync"
import {count} from "./../async/_private/count"
import {countAsync} from "./../async/_private/countAsync"
import {distinct} from "./../async/_private/distinct"
import {distinctAsync} from "./../async/_private/distinctAsync"
import {each} from "./../async/_private/each"
import {eachAsync} from "./../async/_private/eachAsync"
import {elementAt} from "./../async/_private/elementAt"
import {elementAtOrDefault} from "./../async/_private/elementAtOrDefault"
import {except} from "./../async/_private/except"
import {exceptAsync} from "./../async/_private/exceptAsync"
import {first} from "./../async/_private/first"
import {firstAsync} from "./../async/_private/firstAsync"
import {firstOrDefault} from "./../async/_private/firstOrDefault"
import {firstOrDefaultAsync} from "./../async/_private/firstOrDefaultAsync"
import {groupBy} from "./../async/_private/groupBy"
import {groupByAsync} from "./../async/_private/groupByAsync"
import {groupByWithSel} from "./../async/_private/groupByWithSel"
import {intersect} from "./../async/_private/intersect"
import {intersectAsync} from "./../async/_private/intersectAsync"
import {join} from "./../async/_private/join"
import {last} from "./../async/_private/last"
import {lastAsync} from "./../async/_private/lastAsync"
import {lastOrDefault} from "./../async/_private/lastOrDefault"
import {lastOrDefaultAsync} from "./../async/_private/lastOrDefaultAsync"
import {max} from "./../async/_private/max"
import {maxAsync} from "./../async/_private/maxAsync"
import {min} from "./../async/_private/min"
import {minAsync} from "./../async/_private/minAsync"
import {ofType} from "./../async/_private/ofType"
import {orderBy} from "./../async/_private/orderBy"
import {orderByAsync} from "./../async/_private/orderByAsync"
import {orderByDescending} from "./../async/_private/orderByDescending"
import {orderByDescendingAsync} from "./../async/_private/orderByDescendingAsync"
import {partition} from "./../async/_private/partition"
import {partitionAsync} from "./../async/_private/partitionAsync"
import {reverse} from "./../async/_private/reverse"
import {select} from "./../async/_private/select"
import {selectAsync} from "./../async/_private/selectAsync"
import {selectMany} from "./../async/_private/selectMany"
import {selectManyAsync} from "./../async/_private/selectManyAsync"
import {sequenceEquals} from "./../async/_private/sequenceEquals"
import {sequenceEqualsAsync} from "./../async/_private/sequenceEqualsAsync"
import {single} from "./../async/_private/single"
import {singleAsync} from "./../async/_private/singleAsync"
import {singleOrDefault} from "./../async/_private/singleOrDefault"
import {singleOrDefaultAsync} from "./../async/_private/singleOrDefaultAsync"
import {skip} from "./../async/_private/skip"
import {skipWhile} from "./../async/_private/skipWhile"
import {skipWhileAsync} from "./../async/_private/skipWhileAsync"
import {sum} from "./../async/_private/sum"
import {sumAsync} from "./../async/_private/sumAsync"
import {take} from "./../async/_private/take"
import {takeWhile} from "./../async/_private/takeWhile"
import {takeWhileAsync} from "./../async/_private/takeWhileAsync"
import {toArray} from "./../async/_private/toArray"
import {toMap} from "./../async/_private/toMap"
import {toMapAsync} from "./../async/_private/toMapAsync"
import {toObject} from "./../async/_private/toObject"
import {toObjectAsync} from "./../async/_private/toObjectAsync"
import {toSet} from "./../async/_private/toSet"
import {union} from "./../async/_private/union"
import {unionAsync} from "./../async/_private/unionAsync"
import {where} from "./../async/_private/where"
import {whereAsync} from "./../async/_private/whereAsync"
import {zip} from "./../async/_private/zip"
import {zipAsync} from "./../async/_private/zipAsync"

/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */

/**
 * Binds LINQ methods to an iterable type
 * @param object Iterable Type
 */
export const bindLinqAsync = <T extends any, Y extends AsyncIterable<T>>(object: IPrototype<Y>) => {
    const prototype = object.prototype as IAsyncEnumerable<T>

    const bind = <TKey extends Exclude<keyof IAsyncEnumerable<T>, keyof AsyncIterable<T>>, TParams extends Parameters<IAsyncEnumerable<T>[TKey]>>
    (func: (x: IAsyncEnumerable<T>, ...params: TParams) => ReturnType<IAsyncEnumerable<any>[TKey]>, key: TKey) => {
        const wrapped = function (this: IAsyncEnumerable<any>, ...params: TParams) {
            return func(this, ...params)
        }

        Object.defineProperty(wrapped, "length", {value: func.length - 1})
        prototype[key] = wrapped as IAsyncEnumerable<T>[TKey]
    }

    bind(aggregate, "Aggregate")
    bind(all, "All")
    bind(allAsync, "AllAsync")
    bind(any, "Any")
    bind(anyAsync, "AnyAsync")
    bind(asParallel, "AsParallel")
    bind(average, "Average")
    bind(averageAsync, "AverageAsync")
    bind(concatenate, "Concatenate")
    bind(contains, "Contains")
    bind(containsAsync, "ContainsAsync")
    bind(count, "Count")
    bind(countAsync, "CountAsync")
    bind(distinct, "Distinct")
    bind(distinctAsync, "DistinctAsync")
    bind(each, "Each")
    bind(eachAsync, "EachAsync")
    bind(elementAt, "ElementAt")
    bind(elementAtOrDefault, "ElementAtOrDefault")
    bind(except, "Except")
    bind(exceptAsync, "ExceptAsync")
    bind(first, "First")
    bind(firstAsync, "FirstAsync")
    bind(firstOrDefault, "FirstOrDefault")
    bind(firstOrDefaultAsync, "FirstOrDefaultAsync")
    bind(groupBy, "GroupBy")
    bind(groupByAsync, "GroupByAsync")
    bind(groupByWithSel, "GroupByWithSel")
    bind(intersect, "Intersect")
    bind(intersectAsync, "IntersectAsync")
    bind(join, "JoinByKey")
    bind(last, "Last")
    bind(lastAsync, "LastAsync")
    bind(lastOrDefault, "LastOrDefault")
    bind(lastOrDefaultAsync, "LastOrDefaultAsync")
    bind(max, "Max")
    bind(maxAsync, "MaxAsync")
    bind(min, "Min")
    bind(minAsync, "MinAsync")
    bind(ofType, "OfType")
    bind(orderBy, "OrderBy")
    bind(orderByAsync, "OrderByAsync")
    bind(orderByDescending, "OrderByDescending")
    bind(orderByDescendingAsync, "OrderByDescendingAsync")
    bind(partition, "Partition")
    bind(partitionAsync, "PartitionAsync")
    bind(reverse, "Reverse")
    bind(select, "Select")
    bind(selectAsync, "SelectAsync")
    bind(selectMany, "SelectMany")
    bind(selectManyAsync, "SelectManyAsync")
    bind(sequenceEquals, "SequenceEquals")
    bind(sequenceEqualsAsync, "SequenceEqualsAsync")
    bind(single, "Single")
    bind(singleAsync, "SingleAsync")
    bind(singleOrDefault, "SingleOrDefault")
    bind(singleOrDefaultAsync, "SingleOrDefaultAsync")
    bind(skip, "Skip")
    bind(skipWhile, "SkipWhile")
    bind(skipWhileAsync, "SkipWhileAsync")
    bind(sum, "Sum")
    bind(sumAsync, "SumAsync")
    bind(take, "Take")
    bind(takeWhile, "TakeWhile")
    bind(takeWhileAsync, "TakeWhileAsync")
    bind(toArray, "ToArray")
    bind(toMap, "ToMap")
    bind(toMapAsync, "ToMapAsync")
    bind(toObject, "ToObject")
    bind(toObjectAsync, "ToObjectAsync")
    bind(toSet, "ToSet")
    bind(union, "Union")
    bind(unionAsync, "UnionAsync")
    bind(where, "Where")
    bind(whereAsync, "WhereAsync")
    bind(zip, "Zip")
    bind(zipAsync, "ZipAsync")
}
