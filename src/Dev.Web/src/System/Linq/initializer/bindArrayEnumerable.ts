import {ErrorString} from "../shared"
import {ArrayEnumerable} from "../sync/ArrayEnumerable"
import {BasicEnumerable} from '../sync/BasicEnumerable'
import {IEnumerable} from '../types'
import {ArgumentOutOfRangeException, InvalidOperationException} from "../../Exceptions";

/**
 * @private
 */
export const bindArrayEnumerable = <T, TKey extends keyof IEnumerable<T>>() => {
    const {prototype} = ArrayEnumerable
    const propertyNames = Object.getOwnPropertyNames(BasicEnumerable.prototype) as TKey[]
    for (const prop of propertyNames) {
        // @ts-ignore
        prototype[prop] = prototype[prop] ?? BasicEnumerable.prototype[prop]
    }

    prototype.All = function (this: ArrayEnumerable<T>, predicate: (x: T) => boolean): boolean {
        return this.every(predicate)
    }
    prototype.Any = function (predicate?: (x: T) => boolean): boolean {
        if (predicate) {
            return this.some(predicate)
        } else {
            return this.length !== 0
        }
    }
    prototype.Count = function (predicate?: (x: T) => boolean) {
        if (predicate) {
            // eslint-disable-next-line no-shadow
            let count = 0
            for (let i = 0; i < this.length; i++) {
                if (predicate(this[i]) === true) {
                    count++
                }
            }
            return count
        } else {
            return this.length
        }
    }
    prototype.ElementAt = function (index: number): T {
        if (index < 0 || index >= this.length) {
            throw new ArgumentOutOfRangeException("index")
        }

        return this[index] as T
    }
    prototype.ElementAtOrDefault = function (index: number): T | null {
        return (this[index] as T | undefined) || null
    }
    prototype.First = function (predicate?: (x: T) => boolean): T {
        if (predicate) {
            const value = this.find(predicate) as T | undefined
            if (value === undefined) {
                throw new InvalidOperationException(ErrorString.NoMatch)
            } else {
                return value
            }
        } else {
            if (this.length === 0) {
                throw new InvalidOperationException(ErrorString.NoElements)
            }

            return this[0] as T
        }
    }
    prototype.FirstOrDefault = function (predicate?: (x: T) => boolean): T | null {
        if (predicate) {
            const value = this.find(predicate) as T | undefined
            if (value === undefined) {
                return null
            } else {
                return value
            }
        } else {
            return this.length === 0 ? null : this[0] as T
        }
    }
    prototype.Last = function (predicate?: (x: T) => boolean): T {
        if (predicate) {
            for (let i = this.length - 1; i >= 0; i--) {
                const value = this[i] as T
                if (predicate(value) === true) {
                    return value
                }
            }

            throw new InvalidOperationException(ErrorString.NoMatch)
        } else {
            if (this.length === 0) {
                throw new InvalidOperationException(ErrorString.NoElements)
            }

            return this[this.length - 1] as T
        }
    }
    prototype.LastOrDefault = function (predicate?: (x: T) => boolean): T | null {
        if (predicate) {
            for (let i = this.length - 1; i >= 0; i--) {
                const value = this[i] as T
                if (predicate(value) === true) {
                    return value
                }
            }

            return null
        } else {
            return this.length === 0 ? null : this[this.length - 1] as T
        }
    }
    prototype.Max = function (this: ArrayEnumerable<any>, selector?: (x: T) => number): number | never {
        if (this.length === 0) {
            throw new InvalidOperationException(ErrorString.NoElements)
        }

        if (selector) {
            // eslint-disable-next-line no-shadow
            let max = Number.NEGATIVE_INFINITY

            for (let i = 0; i < this.length; i++) {
                max = Math.max(selector(this[i] as T), max)
            }

            return max
        } else {
            return Math.max.apply(null, this as ArrayEnumerable<number>)
        }
    }
    prototype.Min = function (this: ArrayEnumerable<any>, selector?: (x: T) => number): number | never {
        if (this.length === 0) {
            throw new InvalidOperationException(ErrorString.NoElements)
        }

        if (selector) {
            // eslint-disable-next-line no-shadow
            let min = Number.POSITIVE_INFINITY

            for (let i = 0; i < this.length; i++) {
                min = Math.min(selector(this[i] as T), min)
            }

            return min
        } else {
            return Math.min.apply(null, this as ArrayEnumerable<number>)
        }
    }
    prototype.Reverse = function () {
        Array.prototype.reverse.apply(this)
        return this
    }
}
