import {IParallelEnumerable, IPrototype} from "../types"

import {aggregate} from "./../parallel/_private/aggregate"
import {all} from "./../parallel/_private/all"
import {allAsync} from "./../parallel/_private/allAsync"
import {any} from "./../parallel/_private/any"
import {anyAsync} from "./../parallel/_private/anyAsync"
import {asAsync} from "./../parallel/_private/asAsync"
import {average} from "./../parallel/_private/average"
import {averageAsync} from "./../parallel/_private/averageAsync"
import {concatenate} from "../parallel/_private/concatenate"
import {contains} from "./../parallel/_private/contains"
import {containsAsync} from "./../parallel/_private/containsAsync"
import {count} from "./../parallel/_private/count"
import {countAsync} from "./../parallel/_private/countAsync"
import {distinct} from "./../parallel/_private/distinct"
import {distinctAsync} from "./../parallel/_private/distinctAsync"
import {each} from "./../parallel/_private/each"
import {eachAsync} from "./../parallel/_private/eachAsync"
import {elementAt} from "./../parallel/_private/elementAt"
import {elementAtOrDefault} from "./../parallel/_private/elementAtOrDefault"
import {except} from "./../parallel/_private/except"
import {exceptAsync} from "./../parallel/_private/exceptAsync"
import {first} from "./../parallel/_private/first"
import {firstAsync} from "./../parallel/_private/firstAsync"
import {firstOrDefault} from "./../parallel/_private/firstOrDefault"
import {firstOrDefaultAsync} from "./../parallel/_private/firstOrDefaultAsync"
import {groupBy} from "./../parallel/_private/groupBy"
import {groupByAsync} from "./../parallel/_private/groupByAsync"
import {groupByWithSel} from "./../parallel/_private/groupByWithSel"
import {intersect} from "./../parallel/_private/intersect"
import {intersectAsync} from "./../parallel/_private/intersectAsync"
import {join} from "./../parallel/_private/join"
import {last} from "./../parallel/_private/last"
import {lastAsync} from "./../parallel/_private/lastAsync"
import {lastOrDefault} from "./../parallel/_private/lastOrDefault"
import {lastOrDefaultAsync} from "./../parallel/_private/lastOrDefaultAsync"
import {max} from "./../parallel/_private/max"
import {maxAsync} from "./../parallel/_private/maxAsync"
import {min} from "./../parallel/_private/min"
import {minAsync} from "./../parallel/_private/minAsync"
import {ofType} from "./../parallel/_private/ofType"
import {orderBy} from "./../parallel/_private/orderBy"
import {orderByAsync} from "./../parallel/_private/orderByAsync"
import {orderByDescending} from "./../parallel/_private/orderByDescending"
import {orderByDescendingAsync} from "./../parallel/_private/orderByDescendingAsync"
import {partition} from "./../parallel/_private/partition"
import {partitionAsync} from "./../parallel/_private/partitionAsync"
import {reverse} from "./../parallel/_private/reverse"
import {select} from "./../parallel/_private/select"
import {selectAsync} from "./../parallel/_private/selectAsync"
import {selectMany} from "./../parallel/_private/selectMany"
import {selectManyAsync} from "./../parallel/_private/selectManyAsync"
import {sequenceEquals} from "./../parallel/_private/sequenceEquals"
import {sequenceEqualsAsync} from "./../parallel/_private/sequenceEqualsAsync"
import {single} from "./../parallel/_private/single"
import {singleAsync} from "./../parallel/_private/singleAsync"
import {singleOrDefault} from "./../parallel/_private/singleOrDefault"
import {singleOrDefaultAsync} from "./../parallel/_private/singleOrDefaultAsync"
import {skip} from "./../parallel/_private/skip"
import {skipWhile} from "./../parallel/_private/skipWhile"
import {skipWhileAsync} from "./../parallel/_private/skipWhileAsync"
import {sum} from "./../parallel/_private/sum"
import {sumAsync} from "./../parallel/_private/sumAsync"
import {take} from "./../parallel/_private/take"
import {takeWhile} from "./../parallel/_private/takeWhile"
import {takeWhileAsync} from "./../parallel/_private/takeWhileAsync"
import {toArray} from "./../parallel/_private/toArray"
import {toMap} from "./../parallel/_private/toMap"
import {toMapAsync} from "./../parallel/_private/toMapAsync"
import {toObject} from "./../parallel/_private/toObject"
import {toObjectAsync} from "./../parallel/_private/toObjectAsync"
import {toSet} from "./../parallel/_private/toSet"
import {union} from "./../parallel/_private/union"
import {unionAsync} from "./../parallel/_private/unionAsync"
import {where} from "./../parallel/_private/where"
import {whereAsync} from "./../parallel/_private/whereAsync"
import {zip} from "./../parallel/_private/zip"
import {zipAsync} from "./../parallel/_private/zipAsync"

/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */

/**
 * Binds LINQ methods to an iterable type
 * @param object Iterable Type
 */
export const bindLinqParallel = <T, Y extends AsyncIterable<T>>(object: IPrototype<Y>) => {
    const prototype = object.prototype as IParallelEnumerable<T>

    const bind = <TKey extends Exclude<keyof IParallelEnumerable<T>, keyof AsyncIterable<T> | "dataFunc">, TParams extends Parameters<IParallelEnumerable<T>[TKey]>>
    (func: (x: IParallelEnumerable<T>, ...params: TParams) => ReturnType<IParallelEnumerable<T>[TKey]>, key: TKey) => {
        const wrapped = function (this: IParallelEnumerable<T>, ...params: TParams) {
            return func(this, ...params)
        }
        Object.defineProperty(wrapped, "length", {value: func.length - 1})
        prototype[key] = wrapped as any
    }

    bind(aggregate, "Aggregate")
    bind(all, "All")
    bind(allAsync, "AllAsync")
    bind(any, "Any")
    bind(anyAsync, "AnyAsync")
    bind(asAsync, "AsAsync")
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
