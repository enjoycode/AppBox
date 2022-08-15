import {IEnumerable, IPrototype} from "../types"

import {aggregate} from "./../sync/_private/aggregate"
import {all} from "./../sync/_private/all"
import {allAsync} from "./../sync/_private/allAsync"
import {any} from "./../sync/_private/any"
import {anyAsync} from "./../sync/_private/anyAsync"
import {asAsync} from "./../sync/_private/asAsync"
import {asParallel} from "./../sync/_private/asParallel"
import {average} from "./../sync/_private/average"
import {averageAsync} from "./../sync/_private/averageAsync"
import {concatenate} from "../sync/_private/concatenate"
import {contains} from "./../sync/_private/contains"
import {containsAsync} from "./../sync/_private/containsAsync"
import {count} from "./../sync/_private/count"
import {countAsync} from "./../sync/_private/countAsync"
import {distinct} from "./../sync/_private/distinct"
import {distinctAsync} from "./../sync/_private/distinctAsync"
import {each} from "./../sync/_private/each"
import {eachAsync} from "./../sync/_private/eachAsync"
import {elementAt} from "./../sync/_private/elementAt"
import {elementAtOrDefault} from "./../sync/_private/elementAtOrDefault"
import {except} from "./../sync/_private/except"
import {exceptAsync} from "./../sync/_private/exceptAsync"
import {first} from "./../sync/_private/first"
import {firstAsync} from "./../sync/_private/firstAsync"
import {firstOrDefault} from "./../sync/_private/firstOrDefault"
import {firstOrDefaultAsync} from "./../sync/_private/firstOrDefaultAsync"
import {groupBy} from "./../sync/_private/groupBy"
import {groupByAsync} from "./../sync/_private/groupByAsync"
import {groupByWithSel} from "./../sync/_private/groupByWithSel"
import {intersect} from "./../sync/_private/intersect"
import {intersectAsync} from "./../sync/_private/intersectAsync"
import {join} from "./../sync/_private/join"
import {last} from "./../sync/_private/last"
import {lastAsync} from "./../sync/_private/lastAsync"
import {lastOrDefault} from "./../sync/_private/lastOrDefault"
import {lastOrDefaultAsync} from "./../sync/_private/lastOrDefaultAsync"
import {max} from "./../sync/_private/max"
import {maxAsync} from "./../sync/_private/maxAsync"
import {min} from "./../sync/_private/min"
import {minAsync} from "./../sync/_private/minAsync"
import {ofType} from "./../sync/_private/ofType"
import {orderBy} from "./../sync/_private/orderBy"
import {orderByAsync} from "./../sync/_private/orderByAsync"
import {orderByDescending} from "./../sync/_private/orderByDescending"
import {orderByDescendingAsync} from "./../sync/_private/orderByDescendingAsync"
import {partition} from "./../sync/_private/partition"
import {partitionAsync} from "./../sync/_private/partitionAsync"
import {reverse} from "./../sync/_private/reverse"
import {select, cast} from "./../sync/_private/select"
import {selectAsync} from "./../sync/_private/selectAsync"
import {selectMany} from "./../sync/_private/selectMany"
import {selectManyAsync} from "./../sync/_private/selectManyAsync"
import {sequenceEquals} from "./../sync/_private/sequenceEquals"
import {sequenceEqualsAsync} from "./../sync/_private/sequenceEqualsAsync"
import {single} from "./../sync/_private/single"
import {singleAsync} from "./../sync/_private/singleAsync"
import {singleOrDefault} from "./../sync/_private/singleOrDefault"
import {singleOrDefaultAsync} from "./../sync/_private/singleOrDefaultAsync"
import {skip} from "./../sync/_private/skip"
import {skipWhile} from "./../sync/_private/skipWhile"
import {skipWhileAsync} from "./../sync/_private/skipWhileAsync"
import {sum} from "./../sync/_private/sum"
import {sumAsync} from "./../sync/_private/sumAsync"
import {take} from "./../sync/_private/take"
import {takeWhile} from "./../sync/_private/takeWhile"
import {takeWhileAsync} from "./../sync/_private/takeWhileAsync"
import {toArray} from "./../sync/_private/toArray"
import {toMap} from "./../sync/_private/toMap"
import {toMapAsync} from "./../sync/_private/toMapAsync"
import {toObject} from "./../sync/_private/toObject"
import {toObjectAsync} from "./../sync/_private/toObjectAsync"
import {toSet} from "./../sync/_private/toSet"
import {union} from "./../sync/_private/union"
import {unionAsync} from "./../sync/_private/unionAsync"
import {where} from "./../sync/_private/where"
import {whereAsync} from "./../sync/_private/whereAsync"
import {zip} from "./../sync/_private/zip"
import {zipAsync} from "./../sync/_private/zipAsync"

/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */

/**
 * Binds LINQ methods to an iterable type
 * @param object Iterable Type
 */
export const bindLinq = <T, Y extends Iterable<T>>(object: IPrototype<Y>) => {
    const prototype = object.prototype as IEnumerable<T>

    // The static methods take an IEnumerable as first argument
    // when wrapping the first argument becomes `this`

    const bind = <TKey extends Exclude<keyof IEnumerable<T>, keyof Iterable<T>>, TParams extends Parameters<IEnumerable<T>[TKey]>>
    (func: (x: IEnumerable<T>, ...params: TParams) => ReturnType<IEnumerable<any>[TKey]>, key: TKey) => {
        const wrapped = function (this: IEnumerable<any>, ...params: TParams) {
            return func(this, ...params)
        }

        Object.defineProperty(wrapped, "length", {value: func.length - 1})
        prototype[key] = wrapped as IEnumerable<T>[TKey]
    }

    bind(aggregate, "Aggregate")
    bind(all, "All")
    bind(allAsync, "AllAsync")
    bind(any, "Any")
    bind(anyAsync, "AnyAsync")
    bind(asAsync, "AsAsync")
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
    bind(partition, "Partition")
    bind(partitionAsync, "PartitionAsync")
    bind(toSet, "ToSet")
    bind(union, "Union")
    bind(unionAsync, "UnionAsync")
    bind(where, "Where")
    bind(whereAsync, "WhereAsync")
    bind(zip, "Zip")
    bind(zipAsync, "ZipAsync")

    bind(cast, "Cast")
}
