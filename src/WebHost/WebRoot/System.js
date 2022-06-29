var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const IsNullOrEmpty = function(s2) {
  return s2 == null || s2.length === 0;
};
const OpEquality = function(a2, b2) {
  if (a2 == null && b2 == null)
    return true;
  if (a2 == null || b2 == null)
    return false;
  return a2.constructor.op_Equality(a2, b2);
};
const OpInequality = function(a2, b2) {
  return !OpEquality(a2, b2);
};
const StringToUint16Array = function(str) {
  let buf = new Uint16Array(str.length);
  for (let i2 = 0; i2 < str.length; i2++) {
    buf[i2] = str.charCodeAt(i2);
  }
  return buf;
};
const BinarySearch = function(array, index, length, value, comparer) {
  let num1 = index;
  let num2 = index + length - 1;
  while (num1 <= num2) {
    let index1 = num1 + (num2 - num1 >> 1);
    let num3 = comparer.Compare(array[index1], value);
    if (num3 == 0)
      return index1;
    if (num3 < 0)
      num1 = index1 + 1;
    else
      num2 = index1 - 1;
  }
  return ~num1;
};
class Event {
  constructor() {
    __publicField(this, "_listeners");
    __publicField(this, "_it", -1);
  }
  Add(listener, caller) {
    if (!this._listeners)
      this._listeners = [];
    let item = { callback: listener };
    if (caller)
      item.target = new WeakRef(caller);
    this._listeners.push(item);
  }
  Remove(listener, caller) {
    if (!this._listeners)
      return;
    for (let i2 = 0; i2 < this._listeners.length; i2++) {
      const item = this._listeners[i2];
      if (item.target?.deref() === caller && item.callback === listener) {
        this._listeners.splice(i2, 1);
        break;
      }
    }
    if (this._it >= 0) {
      this._it--;
    }
  }
  Invoke(arg) {
    if (!this._listeners)
      return;
    this._it = 0;
    while (this._it < this._listeners.length) {
      const item = this._listeners[this._it];
      const target = item.target?.deref();
      const notAlive = item.target !== void 0 && target === void 0;
      if (notAlive) {
        this._listeners.splice(this._it, 1);
      } else {
        item.callback.call(target, arg);
        this._it++;
      }
    }
    this._it = -1;
  }
}
class Random {
  Next(min3, max3) {
    return Math.random() * (max3 - min3) | 0;
  }
}
class Exception extends Error {
  constructor(message) {
    super(message);
  }
}
class ArgumentException extends Error {
  constructor(message) {
    super(message);
    this.name = `ArgumentException`;
    this.stack = this.stack || new Error().stack;
  }
}
class ArgumentNullException extends Error {
  constructor(message) {
    super(message);
    this.name = `ArgumentException`;
    this.stack = this.stack || new Error().stack;
  }
}
class ArgumentOutOfRangeException extends RangeError {
  constructor(paramName, msg) {
    super(`${paramName} was out of range.` + msg);
    this.paramName = paramName;
    this.msg = msg;
    this.name = `ArgumentOutOfRangeException`;
    this.stack = this.stack || new Error().stack;
  }
}
class IndexOutOfRangeException extends RangeError {
  constructor(paramName) {
    super(`${paramName} was out of range. Must be non-negative and less than the size of the collection.`);
    this.paramName = paramName;
    this.name = `IndexOutOfRangeException`;
    this.stack = this.stack || new Error().stack;
  }
}
class NotSupportedException extends Error {
}
class InvalidOperationException extends Error {
  constructor(message) {
    super(message);
    this.name = `InvalidOperationException`;
    this.stack = this.stack || new Error().stack;
  }
}
class NotImplementedException extends Error {
  constructor(message) {
    super(message);
    this.name = `NotImplementedException`;
    this.stack = this.stack || new Error().stack;
  }
}
const TicksPerSecond = 1e3;
class TimeSpan {
  constructor(a1, a2, a3) {
    __publicField(this, "_ticks");
    if (a2 == void 0) {
      this._ticks = a1;
    } else {
      this._ticks = TimeSpan.TimeToTicks(a1, a2, a3);
    }
  }
  get TotalMilliseconds() {
    return this._ticks;
  }
  get TotalSeconds() {
    return this._ticks / TicksPerSecond;
  }
  Clone() {
    return new TimeSpan(this._ticks);
  }
  static TimeToTicks(hours, minutes, seconds) {
    let ticks = (hours * 3600 + minutes * 60 + seconds) * TicksPerSecond;
    if (ticks > Number.MAX_SAFE_INTEGER)
      throw new ArgumentOutOfRangeException("all");
    return ticks;
  }
}
class DateTime {
  constructor(a1, a2, a3, a4, a5, a6) {
    __publicField(this, "_date");
    if (a1 instanceof Date) {
      this._date = a1;
    } else if (a4 === void 0) {
      this._date = new Date(a1, a2, a3);
    } else {
      this._date = new Date(a1, a2, a3, a4, a5, a6);
    }
  }
  static get UtcNow() {
    return new DateTime(new Date());
  }
  get Ticks() {
    return BigInt(this._date.getTime()) * 10000n + 621355968000000000n;
  }
  Subtract(other) {
    if (other instanceof DateTime) {
      return new TimeSpan(this._date.getTime() - other._date.getTime());
    } else {
      let internalTicks = this._date.getTime();
      let otherTicks = other.TotalMilliseconds;
      if (internalTicks < otherTicks)
        throw new ArgumentOutOfRangeException("other");
      let newTicks = internalTicks - otherTicks;
      let result = new Date();
      result.setTime(newTicks);
      return new DateTime(result);
    }
  }
  static op_Subtraction(v2, other) {
    if (other instanceof DateTime)
      return v2.Subtract(other);
    return v2.Subtract(other);
  }
  Clone() {
    return new DateTime(this._date);
  }
  toString() {
    return this._date.toString();
  }
}
class Guid {
  constructor(arg) {
    __publicField(this, "_data");
    if (arg instanceof Uint8Array) {
      this._data = arg;
    } else {
      throw new Error("\u672A\u5B9E\u73B0");
    }
  }
  get Value() {
    return this._data;
  }
}
var ParallelGeneratorType = /* @__PURE__ */ ((ParallelGeneratorType2) => {
  ParallelGeneratorType2[ParallelGeneratorType2["PromiseToArray"] = 0] = "PromiseToArray";
  ParallelGeneratorType2[ParallelGeneratorType2["ArrayOfPromises"] = 1] = "ArrayOfPromises";
  ParallelGeneratorType2[ParallelGeneratorType2["PromiseOfPromises"] = 2] = "PromiseOfPromises";
  return ParallelGeneratorType2;
})(ParallelGeneratorType || {});
const ErrorString = Object.freeze({
  MoreThanOneElement: `Sequence contains more than one element`,
  MoreThanOneMatchingElement: `Sequence contains more than one matching element`,
  NoElements: `Sequence contains no elements`,
  NoMatch: `Sequence contains no matching element`
});
const StrictEqualityComparer = (x, y2) => x === y2;
class ArrayEnumerable extends Array {
}
class BasicAsyncEnumerable {
  constructor(iterator) {
    this.iterator = iterator;
  }
  [Symbol.asyncIterator]() {
    return this.iterator();
  }
}
class BasicParallelEnumerable {
  constructor(dataFunc) {
    __publicField(this, "dataFunc");
    this.dataFunc = dataFunc;
  }
  [Symbol.asyncIterator]() {
    const { dataFunc } = this;
    async function* iterator() {
      switch (dataFunc.type) {
        case ParallelGeneratorType.ArrayOfPromises:
          for (const value of dataFunc.generator()) {
            yield value;
          }
          break;
        case ParallelGeneratorType.PromiseOfPromises:
          for (const value of await dataFunc.generator()) {
            yield value;
          }
          break;
        case ParallelGeneratorType.PromiseToArray:
        default:
          for (const value of await dataFunc.generator()) {
            yield value;
          }
          break;
      }
    }
    return iterator();
  }
}
class BasicEnumerable {
  constructor(iterator) {
    this.iterator = iterator;
  }
  [Symbol.iterator]() {
    return this.iterator();
  }
}
const bindArray = (jsArray) => {
  const arrayEnumerablePrototype = ArrayEnumerable.prototype;
  const bindToPrototype = jsArray.prototype;
  const propertyNames = Object.getOwnPropertyNames(arrayEnumerablePrototype);
  for (const prop of propertyNames) {
    bindToPrototype[prop] = bindToPrototype[prop] ?? arrayEnumerablePrototype[prop];
  }
};
const bindArrayEnumerable = () => {
  const { prototype } = ArrayEnumerable;
  const propertyNames = Object.getOwnPropertyNames(BasicEnumerable.prototype);
  for (const prop of propertyNames) {
    prototype[prop] = prototype[prop] ?? BasicEnumerable.prototype[prop];
  }
  prototype.All = function(predicate) {
    return this.every(predicate);
  };
  prototype.Any = function(predicate) {
    if (predicate) {
      return this.some(predicate);
    } else {
      return this.length !== 0;
    }
  };
  prototype.Count = function(predicate) {
    if (predicate) {
      let count3 = 0;
      for (let i2 = 0; i2 < this.length; i2++) {
        if (predicate(this[i2]) === true) {
          count3++;
        }
      }
      return count3;
    } else {
      return this.length;
    }
  };
  prototype.ElementAt = function(index) {
    if (index < 0 || index >= this.length) {
      throw new ArgumentOutOfRangeException("index");
    }
    return this[index];
  };
  prototype.ElementAtOrDefault = function(index) {
    return this[index] || null;
  };
  prototype.First = function(predicate) {
    if (predicate) {
      const value = this.find(predicate);
      if (value === void 0) {
        throw new InvalidOperationException(ErrorString.NoMatch);
      } else {
        return value;
      }
    } else {
      if (this.length === 0) {
        throw new InvalidOperationException(ErrorString.NoElements);
      }
      return this[0];
    }
  };
  prototype.FirstOrDefault = function(predicate) {
    if (predicate) {
      const value = this.find(predicate);
      if (value === void 0) {
        return null;
      } else {
        return value;
      }
    } else {
      return this.length === 0 ? null : this[0];
    }
  };
  prototype.Last = function(predicate) {
    if (predicate) {
      for (let i2 = this.length - 1; i2 >= 0; i2--) {
        const value = this[i2];
        if (predicate(value) === true) {
          return value;
        }
      }
      throw new InvalidOperationException(ErrorString.NoMatch);
    } else {
      if (this.length === 0) {
        throw new InvalidOperationException(ErrorString.NoElements);
      }
      return this[this.length - 1];
    }
  };
  prototype.LastOrDefault = function(predicate) {
    if (predicate) {
      for (let i2 = this.length - 1; i2 >= 0; i2--) {
        const value = this[i2];
        if (predicate(value) === true) {
          return value;
        }
      }
      return null;
    } else {
      return this.length === 0 ? null : this[this.length - 1];
    }
  };
  prototype.Max = function(selector) {
    if (this.length === 0) {
      throw new InvalidOperationException(ErrorString.NoElements);
    }
    if (selector) {
      let max3 = Number.NEGATIVE_INFINITY;
      for (let i2 = 0; i2 < this.length; i2++) {
        max3 = Math.max(selector(this[i2]), max3);
      }
      return max3;
    } else {
      return Math.max.apply(null, this);
    }
  };
  prototype.Min = function(selector) {
    if (this.length === 0) {
      throw new InvalidOperationException(ErrorString.NoElements);
    }
    if (selector) {
      let min3 = Number.POSITIVE_INFINITY;
      for (let i2 = 0; i2 < this.length; i2++) {
        min3 = Math.min(selector(this[i2]), min3);
      }
      return min3;
    } else {
      return Math.min.apply(null, this);
    }
  };
  prototype.Reverse = function() {
    Array.prototype.reverse.apply(this);
    return this;
  };
};
const aggregate$2 = (source, seedOrFunc, func, resultSelector) => {
  if (resultSelector) {
    if (!func) {
      throw new ReferenceError(`TAccumulate function is undefined`);
    }
    return aggregate3$2(source, seedOrFunc, func, resultSelector);
  } else if (func) {
    return aggregate2$2(source, seedOrFunc, func);
  } else {
    return aggregate1$2(source, seedOrFunc);
  }
};
const aggregate1$2 = (source, func) => {
  let aggregateValue;
  for (const value of source) {
    if (aggregateValue) {
      aggregateValue = func(aggregateValue, value);
    } else {
      aggregateValue = value;
    }
  }
  if (aggregateValue === void 0) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return aggregateValue;
};
const aggregate2$2 = (source, seed, func) => {
  let aggregateValue = seed;
  for (const value of source) {
    aggregateValue = func(aggregateValue, value);
  }
  return aggregateValue;
};
const aggregate3$2 = (source, seed, func, resultSelector) => {
  let aggregateValue = seed;
  for (const value of source) {
    aggregateValue = func(aggregateValue, value);
  }
  return resultSelector(aggregateValue);
};
const all$2 = (source, predicate) => {
  for (const item of source) {
    if (predicate(item) === false) {
      return false;
    }
  }
  return true;
};
const allAsync$2 = async (source, predicate) => {
  for (const item of source) {
    if (await predicate(item) === false) {
      return false;
    }
  }
  return true;
};
const any$2 = (source, predicate) => {
  if (predicate) {
    return any2$2(source, predicate);
  } else {
    return any1$2(source);
  }
};
const any1$2 = (source) => {
  for (const _ of source) {
    return true;
  }
  return false;
};
const any2$2 = (source, predicate) => {
  for (const item of source) {
    if (predicate(item) === true) {
      return true;
    }
  }
  return false;
};
const anyAsync$2 = async (source, predicate) => {
  for (const item of source) {
    if (await predicate(item) === true) {
      return true;
    }
  }
  return false;
};
const fromAsync = (promisesOrIterable) => {
  if (Array.isArray(promisesOrIterable)) {
    if (promisesOrIterable.length === 0) {
      throw new InvalidOperationException(ErrorString.NoElements);
    }
    return new BasicAsyncEnumerable(async function* () {
      for await (const value of promisesOrIterable) {
        yield value;
      }
    });
  } else {
    return new BasicAsyncEnumerable(promisesOrIterable);
  }
};
const asAsync$1 = (source) => {
  async function* generator() {
    for (const value of source) {
      yield value;
    }
  }
  return fromAsync(generator);
};
const fromParallel = (type, generator) => {
  return new BasicParallelEnumerable({
    generator,
    type
  });
};
const asParallel$1 = (source) => {
  const generator = async () => {
    const array = [];
    for (const value of source) {
      array.push(value);
    }
    return array;
  };
  return fromParallel(ParallelGeneratorType.PromiseToArray, generator);
};
const average$2 = (source, selector) => {
  if (selector) {
    return average2$1(source, selector);
  } else {
    return average1$1(source);
  }
};
const average1$1 = (source) => {
  let value;
  let count3;
  for (const item of source) {
    value = (value || 0) + item;
    count3 = (count3 || 0) + 1;
  }
  if (value === void 0) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return value / count3;
};
const average2$1 = (source, func) => {
  let value;
  let count3;
  for (const item of source) {
    value = (value || 0) + func(item);
    count3 = (count3 || 0) + 1;
  }
  if (value === void 0) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return value / count3;
};
const averageAsync$2 = async (source, selector) => {
  let value;
  let count3;
  for (const item of source) {
    value = (value || 0) + await selector(item);
    count3 = (count3 || 0) + 1;
  }
  if (value === void 0) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return value / count3;
};
const concatenate$2 = (first3, second) => {
  function* iterator() {
    yield* first3;
    yield* second;
  }
  return new BasicEnumerable(iterator);
};
const contains$2 = (source, value, comparer = StrictEqualityComparer) => {
  for (const item of source) {
    if (comparer(value, item)) {
      return true;
    }
  }
  return false;
};
const containsAsync$2 = async (source, value, comparer) => {
  for (const item of source) {
    if (await comparer(value, item)) {
      return true;
    }
  }
  return false;
};
const count$2 = (source, predicate) => {
  if (predicate) {
    return count2$2(source, predicate);
  } else {
    return count1$2(source);
  }
};
const count1$2 = (source) => {
  let count3 = 0;
  for (const _ of source) {
    count3++;
  }
  return count3;
};
const count2$2 = (source, predicate) => {
  let count3 = 0;
  for (const value of source) {
    if (predicate(value) === true) {
      count3++;
    }
  }
  return count3;
};
const countAsync$2 = async (source, predicate) => {
  let count3 = 0;
  for (const value of source) {
    if (await predicate(value) === true) {
      count3++;
    }
  }
  return count3;
};
const distinct$2 = (source, comparer = StrictEqualityComparer) => {
  function* iterator() {
    const distinctElements = [];
    for (const item of source) {
      const foundItem = distinctElements.find((x) => comparer(x, item));
      if (!foundItem) {
        distinctElements.push(item);
        yield item;
      }
    }
  }
  return new BasicEnumerable(iterator);
};
const distinctAsync$2 = (source, comparer) => {
  async function* iterator() {
    const distinctElements = [];
    outerLoop:
      for (const item of source) {
        for (const distinctElement of distinctElements) {
          const found = await comparer(distinctElement, item);
          if (found) {
            continue outerLoop;
          }
        }
        distinctElements.push(item);
        yield item;
      }
  }
  return fromAsync(iterator);
};
const each$2 = (source, action) => {
  function* generator() {
    for (const value of source) {
      action(value);
      yield value;
    }
  }
  return new BasicEnumerable(generator);
};
const eachAsync$2 = (source, action) => {
  async function* generator() {
    for (const value of source) {
      await action(value);
      yield value;
    }
  }
  return fromAsync(generator);
};
const elementAt$2 = (source, index) => {
  if (index < 0) {
    throw new ArgumentOutOfRangeException("index");
  }
  let i2 = 0;
  for (const item of source) {
    if (index === i2++) {
      return item;
    }
  }
  throw new ArgumentOutOfRangeException("index");
};
const elementAtOrDefault$2 = (source, index) => {
  let i2 = 0;
  for (const item of source) {
    if (index === i2++) {
      return item;
    }
  }
  return null;
};
const except$2 = (first3, second, comparer = StrictEqualityComparer) => {
  function* iterator() {
    const secondArray = [...second];
    for (const firstItem of first3) {
      let exists = false;
      for (let j = 0; j < secondArray.length; j++) {
        const secondItem = secondArray[j];
        if (comparer(firstItem, secondItem) === true) {
          exists = true;
          break;
        }
      }
      if (exists === false) {
        yield firstItem;
      }
    }
  }
  return new BasicEnumerable(iterator);
};
const exceptAsync$2 = (first3, second, comparer) => {
  async function* iterator() {
    const secondArray = [...second];
    for (const firstItem of first3) {
      let exists = false;
      for (let j = 0; j < secondArray.length; j++) {
        const secondItem = secondArray[j];
        if (await comparer(firstItem, secondItem) === true) {
          exists = true;
          break;
        }
      }
      if (exists === false) {
        yield firstItem;
      }
    }
  }
  return fromAsync(iterator);
};
const first$2 = (source, predicate) => {
  if (predicate) {
    return first2$2(source, predicate);
  } else {
    return first1$2(source);
  }
};
const first1$2 = (source) => {
  const first3 = source[Symbol.iterator]().next();
  if (first3.done === true) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return first3.value;
};
const first2$2 = (source, predicate) => {
  for (const value of source) {
    if (predicate(value) === true) {
      return value;
    }
  }
  throw new InvalidOperationException(ErrorString.NoMatch);
};
const firstAsync$2 = async (source, predicate) => {
  for (const value of source) {
    if (await predicate(value) === true) {
      return value;
    }
  }
  throw new InvalidOperationException(ErrorString.NoMatch);
};
const firstOrDefault$2 = (source, predicate) => {
  if (predicate) {
    return firstOrDefault2$2(source, predicate);
  } else {
    return firstOrDefault1$2(source);
  }
};
const firstOrDefault1$2 = (source) => {
  const first3 = source[Symbol.iterator]().next();
  return first3.value || null;
};
const firstOrDefault2$2 = (source, predicate) => {
  for (const value of source) {
    if (predicate(value) === true) {
      return value;
    }
  }
  return null;
};
const firstOrDefaultAsync$2 = async (source, predicate) => {
  for (const value of source) {
    if (await predicate(value) === true) {
      return value;
    }
  }
  return null;
};
class Grouping extends ArrayEnumerable {
  constructor(key, startingItem) {
    super(1);
    __publicField(this, "key");
    this.key = key;
    this[0] = startingItem;
  }
}
const groupBy_0$2 = (source, keySelector, comparer) => {
  return function* generate() {
    const keyMap = new Array();
    for (const value of source) {
      const key = keySelector(value);
      let found = false;
      for (let i2 = 0; i2 < keyMap.length; i2++) {
        const group = keyMap[i2];
        if (comparer(group.key, key)) {
          group.push(value);
          found = true;
          break;
        }
      }
      if (found === false) {
        keyMap.push(new Grouping(key, value));
      }
    }
    for (const keyValue of keyMap) {
      yield keyValue;
    }
  };
};
const groupBy_0_Simple$2 = (source, keySelector) => {
  return function* iterator() {
    const keyMap = {};
    for (const value of source) {
      const key = keySelector(value);
      const grouping = keyMap[key];
      if (grouping) {
        grouping.push(value);
      } else {
        keyMap[key] = new Grouping(key, value);
      }
    }
    for (const value in keyMap) {
      yield keyMap[value];
    }
  };
};
const groupBy_1_Simple = (source, keySelector, elementSelector) => {
  function* generate() {
    const keyMap = {};
    for (const value of source) {
      const key = keySelector(value);
      const grouping = keyMap[key];
      const element = elementSelector(value);
      if (grouping) {
        grouping.push(element);
      } else {
        keyMap[key] = new Grouping(key, element);
      }
    }
    for (const value in keyMap) {
      yield keyMap[value];
    }
  }
  return new BasicEnumerable(generate);
};
const groupBy_1 = (source, keySelector, elementSelector, comparer) => {
  function* generate() {
    const keyMap = new Array();
    for (const value of source) {
      const key = keySelector(value);
      let found = false;
      for (let i2 = 0; i2 < keyMap.length; i2++) {
        const group = keyMap[i2];
        if (comparer(group.key, key)) {
          group.push(elementSelector(value));
          found = true;
          break;
        }
      }
      if (found === false) {
        const element = elementSelector(value);
        keyMap.push(new Grouping(key, element));
      }
    }
    for (const keyValue of keyMap) {
      yield keyValue;
    }
  }
  return new BasicEnumerable(generate);
};
const groupBy$2 = (source, keySelector, comparer) => {
  let iterable;
  if (comparer) {
    iterable = groupBy_0$2(source, keySelector, comparer);
  } else {
    iterable = groupBy_0_Simple$2(source, keySelector);
  }
  return new BasicEnumerable(iterable);
};
const groupByAsync$2 = (source, keySelector, comparer) => {
  if (comparer) {
    return groupByAsync_0$2(source, keySelector, comparer);
  } else {
    return groupByAsync_0_Simple$2(source, keySelector);
  }
};
const groupByAsync_0_Simple$2 = (source, keySelector) => {
  async function* iterator() {
    const keyMap = {};
    for (const value of source) {
      const key = await keySelector(value);
      const grouping = keyMap[key];
      if (grouping) {
        grouping.push(value);
      } else {
        keyMap[key] = new Grouping(key, value);
      }
    }
    for (const value in keyMap) {
      yield keyMap[value];
    }
  }
  return fromAsync(iterator);
};
const groupByAsync_0$2 = (source, keySelector, comparer) => {
  async function* generate() {
    const keyMap = new Array();
    for (const value of source) {
      const key = await keySelector(value);
      let found = false;
      for (let i2 = 0; i2 < keyMap.length; i2++) {
        const group = keyMap[i2];
        if (await comparer(group.key, key) === true) {
          group.push(value);
          found = true;
          break;
        }
      }
      if (found === false) {
        keyMap.push(new Grouping(key, value));
      }
    }
    for (const keyValue of keyMap) {
      yield keyValue;
    }
  }
  return fromAsync(generate);
};
const groupByWithSel$2 = (source, keySelector, elementSelector, comparer) => {
  if (comparer) {
    return groupBy_1(source, keySelector, elementSelector, comparer);
  } else {
    return groupBy_1_Simple(source, keySelector, elementSelector);
  }
};
const intersect$2 = (first3, second, comparer = StrictEqualityComparer) => {
  function* iterator() {
    const firstResults = [...first3.Distinct(comparer)];
    if (firstResults.length === 0) {
      return;
    }
    const secondResults = [...second];
    for (let i2 = 0; i2 < firstResults.length; i2++) {
      const firstValue = firstResults[i2];
      for (let j = 0; j < secondResults.length; j++) {
        const secondValue = secondResults[j];
        if (comparer(firstValue, secondValue) === true) {
          yield firstValue;
          break;
        }
      }
    }
  }
  return new BasicEnumerable(iterator);
};
const intersectAsync$2 = (first3, second, comparer) => {
  async function* iterator() {
    const firstResults = [];
    for await (const item of first3.DistinctAsync(comparer)) {
      firstResults.push(item);
    }
    if (firstResults.length === 0) {
      return;
    }
    const secondResults = [...second];
    for (let i2 = 0; i2 < firstResults.length; i2++) {
      const firstValue = firstResults[i2];
      for (let j = 0; j < secondResults.length; j++) {
        const secondValue = secondResults[j];
        if (await comparer(firstValue, secondValue) === true) {
          yield firstValue;
          break;
        }
      }
    }
  }
  return fromAsync(iterator);
};
const join$2 = (outer, inner, outerKeySelector, innerKeySelector, resultSelector, comparer = StrictEqualityComparer) => {
  function* iterator() {
    const innerArray = [...inner];
    for (const o2 of outer) {
      const outerKey = outerKeySelector(o2);
      for (const i2 of innerArray) {
        const innerKey = innerKeySelector(i2);
        if (comparer(outerKey, innerKey) === true) {
          yield resultSelector(o2, i2);
        }
      }
    }
  }
  return new BasicEnumerable(iterator);
};
const last$2 = (source, predicate) => {
  if (predicate) {
    return last2$2(source, predicate);
  } else {
    return last1$2(source);
  }
};
const last1$2 = (source) => {
  let lastItem;
  for (const value of source) {
    lastItem = value;
  }
  if (!lastItem) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return lastItem;
};
const last2$2 = (source, predicate) => {
  let lastItem;
  for (const value of source) {
    if (predicate(value) === true) {
      lastItem = value;
    }
  }
  if (!lastItem) {
    throw new InvalidOperationException(ErrorString.NoMatch);
  }
  return lastItem;
};
const lastAsync$2 = async (source, predicate) => {
  let last3;
  for (const value of source) {
    if (await predicate(value) === true) {
      last3 = value;
    }
  }
  if (!last3) {
    throw new InvalidOperationException(ErrorString.NoMatch);
  }
  return last3;
};
const lastOrDefault$2 = (source, predicate) => {
  if (predicate) {
    return lastOrDefault2$2(source, predicate);
  } else {
    return lastOrDefault1$2(source);
  }
};
const lastOrDefault1$2 = (source) => {
  let last3 = null;
  for (const value of source) {
    last3 = value;
  }
  return last3;
};
const lastOrDefault2$2 = (source, predicate) => {
  let last3 = null;
  for (const value of source) {
    if (predicate(value) === true) {
      last3 = value;
    }
  }
  return last3;
};
const lastOrDefaultAsync$2 = async (source, predicate) => {
  let last3 = null;
  for (const value of source) {
    if (await predicate(value) === true) {
      last3 = value;
    }
  }
  return last3;
};
const max$2 = (source, selector) => {
  if (selector) {
    return max2$1(source, selector);
  } else {
    return max1$1(source);
  }
};
const max1$1 = (source) => {
  let maxItem = null;
  for (const item of source) {
    maxItem = Math.max(maxItem || Number.NEGATIVE_INFINITY, item);
  }
  if (maxItem === null) {
    throw new InvalidOperationException(ErrorString.NoElements);
  } else {
    return maxItem;
  }
};
const max2$1 = (source, selector) => {
  let maxItem = null;
  for (const item of source) {
    maxItem = Math.max(maxItem || Number.NEGATIVE_INFINITY, selector(item));
  }
  if (maxItem === null) {
    throw new InvalidOperationException(ErrorString.NoElements);
  } else {
    return maxItem;
  }
};
const maxAsync$2 = async (source, selector) => {
  let max3 = null;
  for (const item of source) {
    max3 = Math.max(max3 || Number.NEGATIVE_INFINITY, await selector(item));
  }
  if (max3 === null) {
    throw new InvalidOperationException(ErrorString.NoElements);
  } else {
    return max3;
  }
};
const min$2 = (source, selector) => {
  if (selector) {
    return min2$1(source, selector);
  } else {
    return min1$1(source);
  }
};
const min1$1 = (source) => {
  let minItem = null;
  for (const item of source) {
    minItem = Math.min(minItem || Number.POSITIVE_INFINITY, item);
  }
  if (minItem === null) {
    throw new InvalidOperationException(ErrorString.NoElements);
  } else {
    return minItem;
  }
};
const min2$1 = (source, selector) => {
  let minItem = null;
  for (const item of source) {
    minItem = Math.min(minItem || Number.POSITIVE_INFINITY, selector(item));
  }
  if (minItem === null) {
    throw new InvalidOperationException(ErrorString.NoElements);
  } else {
    return minItem;
  }
};
const minAsync$2 = async (source, selector) => {
  let min3 = null;
  for (const item of source) {
    min3 = Math.min(min3 || Number.POSITIVE_INFINITY, await selector(item));
  }
  if (min3 === null) {
    throw new InvalidOperationException(ErrorString.NoElements);
  } else {
    return min3;
  }
};
const ofType$2 = (source, type) => {
  const typeCheck = typeof type === "string" ? (x) => typeof x === type : (x) => x instanceof type;
  function* iterator() {
    for (const item of source) {
      if (typeCheck(item)) {
        yield item;
      }
    }
  }
  return new BasicEnumerable(iterator);
};
const asAsyncKeyMap$1 = async (source, keySelector) => {
  const map = /* @__PURE__ */ new Map();
  for await (const item of source) {
    const key = await keySelector(item);
    const currentMapping = map.get(key);
    if (currentMapping) {
      currentMapping.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
};
async function* asAsyncSortedKeyValues$1(source, keySelector, ascending, comparer) {
  const map = await asAsyncKeyMap$1(source, keySelector);
  const sortedKeys = [...map.keys()].sort(comparer ? comparer : void 0);
  if (ascending) {
    for (let i2 = 0; i2 < sortedKeys.length; i2++) {
      yield map.get(sortedKeys[i2]);
    }
  } else {
    for (let i2 = sortedKeys.length - 1; i2 >= 0; i2--) {
      yield map.get(sortedKeys[i2]);
    }
  }
}
const asAsyncKeyMapSync$1 = async (source, keySelector) => {
  const map = /* @__PURE__ */ new Map();
  for (const item of source) {
    const key = await keySelector(item);
    const currentMapping = map.get(key);
    if (currentMapping) {
      currentMapping.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
};
async function* asAsyncSortedKeyValuesSync$1(source, keySelector, ascending, comparer) {
  const map = await asAsyncKeyMapSync$1(source, keySelector);
  const sortedKeys = [...map.keys()].sort(comparer ? comparer : void 0);
  if (ascending) {
    for (let i2 = 0; i2 < sortedKeys.length; i2++) {
      yield map.get(sortedKeys[i2]);
    }
  } else {
    for (let i2 = sortedKeys.length - 1; i2 >= 0; i2--) {
      yield map.get(sortedKeys[i2]);
    }
  }
}
const asKeyMap$2 = async (source, keySelector) => {
  const map = /* @__PURE__ */ new Map();
  for await (const item of source) {
    const key = keySelector(item);
    const currentMapping = map.get(key);
    if (currentMapping) {
      currentMapping.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
};
async function* asSortedKeyValues$2(source, keySelector, ascending, comparer) {
  const map = await asKeyMap$2(source, keySelector);
  const sortedKeys = [...map.keys()].sort(comparer ? comparer : void 0);
  if (ascending) {
    for (let i2 = 0; i2 < sortedKeys.length; i2++) {
      yield map.get(sortedKeys[i2]);
    }
  } else {
    for (let i2 = sortedKeys.length - 1; i2 >= 0; i2--) {
      yield map.get(sortedKeys[i2]);
    }
  }
}
const asKeyMapSync$1 = (source, keySelector) => {
  const map = /* @__PURE__ */ new Map();
  for (const item of source) {
    const key = keySelector(item);
    const currentMapping = map.get(key);
    if (currentMapping) {
      currentMapping.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
};
function* asSortedKeyValuesSync$1(source, keySelector, ascending, comparer) {
  const map = asKeyMapSync$1(source, keySelector);
  const sortedKeys = [...map.keys()].sort(comparer ? comparer : void 0);
  if (ascending) {
    for (let i2 = 0; i2 < sortedKeys.length; i2++) {
      yield map.get(sortedKeys[i2]);
    }
  } else {
    for (let i2 = sortedKeys.length - 1; i2 >= 0; i2--) {
      yield map.get(sortedKeys[i2]);
    }
  }
}
class OrderedAsyncEnumerable extends BasicAsyncEnumerable {
  constructor(orderedPairs) {
    super(async function* () {
      for await (const orderedPair of orderedPairs()) {
        yield* orderedPair;
      }
    });
    this.orderedPairs = orderedPairs;
  }
  static generateAsync(source, keySelector, ascending, comparer) {
    let orderedPairs;
    if (source instanceof OrderedAsyncEnumerable) {
      orderedPairs = async function* () {
        for await (const pair of source.orderedPairs()) {
          yield* asAsyncSortedKeyValuesSync$1(pair, keySelector, ascending, comparer);
        }
      };
    } else {
      orderedPairs = () => asAsyncSortedKeyValues$1(source, keySelector, ascending, comparer);
    }
    return new OrderedAsyncEnumerable(orderedPairs);
  }
  static generate(source, keySelector, ascending, comparer) {
    let orderedPairs;
    if (source instanceof OrderedAsyncEnumerable) {
      orderedPairs = async function* () {
        for await (const pair of source.orderedPairs()) {
          yield* asSortedKeyValuesSync$1(pair, keySelector, ascending, comparer);
        }
      };
    } else {
      orderedPairs = () => asSortedKeyValues$2(source, keySelector, ascending, comparer);
    }
    return new OrderedAsyncEnumerable(orderedPairs);
  }
  ThenBy(keySelector, comparer) {
    return OrderedAsyncEnumerable.generate(this, keySelector, true, comparer);
  }
  ThenByAsync(keySelector, comparer) {
    return OrderedAsyncEnumerable.generateAsync(this, keySelector, true, comparer);
  }
  ThenByDescending(keySelector, comparer) {
    return OrderedAsyncEnumerable.generate(this, keySelector, false, comparer);
  }
  ThenByDescendingAsync(keySelector, comparer) {
    return OrderedAsyncEnumerable.generateAsync(this, keySelector, false, comparer);
  }
}
const asKeyMap$1 = (source, keySelector) => {
  const map = /* @__PURE__ */ new Map();
  for (const item of source) {
    const key = keySelector(item);
    const currentMapping = map.get(key);
    if (currentMapping) {
      currentMapping.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
};
function* asSortedKeyValues$1(source, keySelector, ascending, comparer) {
  const map = asKeyMap$1(source, keySelector);
  const sortedKeys = [...map.keys()].sort(comparer ? comparer : void 0);
  if (ascending) {
    for (let i2 = 0; i2 < sortedKeys.length; i2++) {
      yield map.get(sortedKeys[i2]);
    }
  } else {
    for (let i2 = sortedKeys.length - 1; i2 >= 0; i2--) {
      yield map.get(sortedKeys[i2]);
    }
  }
}
const asKeyMapAsync = async (source, keySelector) => {
  const map = /* @__PURE__ */ new Map();
  for (const item of source) {
    const key = await keySelector(item);
    const currentMapping = map.get(key);
    if (currentMapping) {
      currentMapping.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
};
async function* asSortedKeyValuesAsync(source, keySelector, ascending, comparer) {
  const map = await asKeyMapAsync(source, keySelector);
  const sortedKeys = [...map.keys()].sort(comparer ? comparer : void 0);
  if (ascending) {
    for (let i2 = 0; i2 < sortedKeys.length; i2++) {
      yield map.get(sortedKeys[i2]);
    }
  } else {
    for (let i2 = sortedKeys.length - 1; i2 >= 0; i2--) {
      yield map.get(sortedKeys[i2]);
    }
  }
}
class OrderedEnumerable extends BasicEnumerable {
  constructor(orderedPairs) {
    super(function* () {
      for (const orderedPair of orderedPairs()) {
        yield* orderedPair;
      }
    });
    this.orderedPairs = orderedPairs;
  }
  static generate(source, keySelector, ascending, comparer) {
    let orderedPairs;
    if (source instanceof OrderedEnumerable) {
      orderedPairs = function* () {
        for (const pair of source.orderedPairs()) {
          yield* asSortedKeyValues$1(pair, keySelector, ascending, comparer);
        }
      };
    } else {
      orderedPairs = () => asSortedKeyValues$1(source, keySelector, ascending, comparer);
    }
    return new OrderedEnumerable(orderedPairs);
  }
  static generateAsync(source, keySelector, ascending, comparer) {
    let orderedPairs;
    if (source instanceof OrderedEnumerable) {
      orderedPairs = async function* () {
        for (const pair of source.orderedPairs()) {
          yield* asSortedKeyValuesAsync(pair, keySelector, ascending, comparer);
        }
      };
    } else {
      orderedPairs = () => asSortedKeyValuesAsync(source, keySelector, ascending, comparer);
    }
    return new OrderedAsyncEnumerable(orderedPairs);
  }
  ThenBy(keySelector, comparer) {
    return OrderedEnumerable.generate(this, keySelector, true, comparer);
  }
  ThenByAsync(keySelector, comparer) {
    return OrderedEnumerable.generateAsync(this, keySelector, true, comparer);
  }
  ThenByDescending(keySelector, comparer) {
    return OrderedEnumerable.generate(this, keySelector, false, comparer);
  }
  ThenByDescendingAsync(keySelector, comparer) {
    return OrderedEnumerable.generateAsync(this, keySelector, false, comparer);
  }
}
const orderBy$2 = (source, keySelector, comparer) => {
  return OrderedEnumerable.generate(source, keySelector, true, comparer);
};
const orderByAsync$2 = (source, keySelector, comparer) => {
  return OrderedEnumerable.generateAsync(source, keySelector, true, comparer);
};
const orderByDescending$2 = (source, keySelector, comparer) => {
  return OrderedEnumerable.generate(source, keySelector, false, comparer);
};
const orderByDescendingAsync$2 = (source, keySelector, comparer) => {
  return OrderedEnumerable.generateAsync(source, keySelector, false, comparer);
};
const partition$2 = (source, predicate) => {
  const fail = [];
  const pass = [];
  for (const value of source) {
    if (predicate(value) === true) {
      pass.push(value);
    } else {
      fail.push(value);
    }
  }
  return [pass, fail];
};
const partitionAsync$2 = async (source, predicate) => {
  const fail = [];
  const pass = [];
  for (const value of source) {
    if (await predicate(value) === true) {
      pass.push(value);
    } else {
      fail.push(value);
    }
  }
  return [pass, fail];
};
const reverse$2 = (source) => {
  function* iterator() {
    const array = [...source];
    for (let i2 = array.length - 1; i2 >= 0; i2--) {
      yield array[i2];
    }
  }
  return new BasicEnumerable(iterator);
};
const select$2 = (source, selector) => {
  if (typeof selector === "function") {
    const { length } = selector;
    if (length === 1) {
      return select1$1(source, selector);
    } else {
      return select2$1(source, selector);
    }
  } else {
    return select3$1(source, selector);
  }
};
const select1$1 = (source, selector) => {
  function* iterator() {
    for (const value of source) {
      yield selector(value);
    }
  }
  return new BasicEnumerable(iterator);
};
const select2$1 = (source, selector) => {
  function* iterator() {
    let index = 0;
    for (const value of source) {
      yield selector(value, index);
      index++;
    }
  }
  return new BasicEnumerable(iterator);
};
const select3$1 = (source, key) => {
  function* iterator() {
    for (const value of source) {
      yield value[key];
    }
  }
  return new BasicEnumerable(iterator);
};
const selectAsync$2 = (source, selector) => {
  if (typeof selector === "function") {
    if (selector.length === 1) {
      return selectAsync1$1(source, selector);
    } else {
      return selectAsync2$1(source, selector);
    }
  } else {
    return selectAsync3(source, selector);
  }
};
const selectAsync1$1 = (source, selector) => {
  async function* iterator() {
    for (const value of source) {
      yield selector(value);
    }
  }
  return fromAsync(iterator);
};
const selectAsync2$1 = (source, selector) => {
  async function* iterator() {
    let index = 0;
    for (const value of source) {
      yield selector(value, index);
      index++;
    }
  }
  return fromAsync(iterator);
};
const selectAsync3 = (source, key) => {
  async function* iterator() {
    for (const value of source) {
      yield value[key];
    }
  }
  return fromAsync(iterator);
};
const selectMany$2 = (source, selector) => {
  if (typeof selector === "function") {
    if (selector.length === 1) {
      return selectMany1$1(source, selector);
    } else {
      return selectMany2$1(source, selector);
    }
  } else {
    return selectMany3$1(source, selector);
  }
};
const selectMany1$1 = (source, selector) => {
  function* iterator() {
    for (const value of source) {
      for (const selectorValue of selector(value)) {
        yield selectorValue;
      }
    }
  }
  return new BasicEnumerable(iterator);
};
const selectMany2$1 = (source, selector) => {
  function* iterator() {
    let index = 0;
    for (const value of source) {
      for (const selectorValue of selector(value, index)) {
        yield selectorValue;
      }
      index++;
    }
  }
  return new BasicEnumerable(iterator);
};
const selectMany3$1 = (source, selector) => {
  function* iterator() {
    for (const value of source) {
      for (const selectorValue of value[selector]) {
        yield selectorValue;
      }
    }
  }
  return new BasicEnumerable(iterator);
};
const selectManyAsync$2 = (source, selector) => {
  if (selector.length === 1) {
    return selectManyAsync1(source, selector);
  } else {
    return selectManyAsync2(source, selector);
  }
};
const selectManyAsync1 = (source, selector) => {
  async function* generator() {
    for (const value of source) {
      const innerValues = await selector(value);
      for (const innerValue of innerValues) {
        yield innerValue;
      }
    }
  }
  return fromAsync(generator);
};
const selectManyAsync2 = (source, selector) => {
  async function* generator() {
    let index = 0;
    for (const value of source) {
      const innerValues = await selector(value, index);
      for (const innerValue of innerValues) {
        yield innerValue;
      }
      index++;
    }
  }
  return fromAsync(generator);
};
const sequenceEquals$2 = (first3, second, comparer = StrictEqualityComparer) => {
  const firstIterator = first3[Symbol.iterator]();
  const secondIterator = second[Symbol.iterator]();
  let firstResult = firstIterator.next();
  let secondResult = secondIterator.next();
  while (!firstResult.done && !secondResult.done) {
    if (!comparer(firstResult.value, secondResult.value)) {
      return false;
    }
    firstResult = firstIterator.next();
    secondResult = secondIterator.next();
  }
  return firstResult.done === true && secondResult.done === true;
};
const sequenceEqualsAsync$2 = async (first3, second, comparer) => {
  const firstIterator = first3[Symbol.iterator]();
  const secondIterator = second[Symbol.iterator]();
  let firstResult = firstIterator.next();
  let secondResult = secondIterator.next();
  while (!firstResult.done && !secondResult.done) {
    if (await comparer(firstResult.value, secondResult.value) === false) {
      return false;
    }
    firstResult = firstIterator.next();
    secondResult = secondIterator.next();
  }
  return firstResult.done === true && secondResult.done === true;
};
const single$2 = (source, predicate) => {
  if (predicate) {
    return single2$2(source, predicate);
  } else {
    return single1$2(source);
  }
};
const single1$2 = (source) => {
  let hasValue = false;
  let singleValue = null;
  for (const value of source) {
    if (hasValue === true) {
      throw new InvalidOperationException(ErrorString.MoreThanOneElement);
    } else {
      hasValue = true;
      singleValue = value;
    }
  }
  if (hasValue === false) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return singleValue;
};
const single2$2 = (source, predicate) => {
  let hasValue = false;
  let singleValue = null;
  for (const value of source) {
    if (predicate(value)) {
      if (hasValue === true) {
        throw new InvalidOperationException(ErrorString.MoreThanOneMatchingElement);
      } else {
        hasValue = true;
        singleValue = value;
      }
    }
  }
  if (hasValue === false) {
    throw new InvalidOperationException(ErrorString.NoMatch);
  }
  return singleValue;
};
const singleAsync$2 = async (source, predicate) => {
  let hasValue = false;
  let singleValue = null;
  for (const value of source) {
    if (await predicate(value)) {
      if (hasValue === true) {
        throw new InvalidOperationException(ErrorString.MoreThanOneMatchingElement);
      } else {
        hasValue = true;
        singleValue = value;
      }
    }
  }
  if (hasValue === false) {
    throw new InvalidOperationException(ErrorString.NoMatch);
  }
  return singleValue;
};
const singleOrDefault$2 = (source, predicate) => {
  if (predicate) {
    return singleOrDefault2$2(source, predicate);
  } else {
    return singleOrDefault1$2(source);
  }
};
const singleOrDefault1$2 = (source) => {
  let hasValue = false;
  let singleValue = null;
  for (const value of source) {
    if (hasValue === true) {
      throw new InvalidOperationException(ErrorString.MoreThanOneElement);
    } else {
      hasValue = true;
      singleValue = value;
    }
  }
  return singleValue;
};
const singleOrDefault2$2 = (source, predicate) => {
  let hasValue = false;
  let singleValue = null;
  for (const value of source) {
    if (predicate(value)) {
      if (hasValue === true) {
        throw new InvalidOperationException(ErrorString.MoreThanOneMatchingElement);
      } else {
        hasValue = true;
        singleValue = value;
      }
    }
  }
  return singleValue;
};
const singleOrDefaultAsync$2 = async (source, predicate) => {
  let hasValue = false;
  let singleValue = null;
  for (const value of source) {
    if (await predicate(value)) {
      if (hasValue === true) {
        throw new InvalidOperationException(ErrorString.MoreThanOneElement);
      } else {
        hasValue = true;
        singleValue = value;
      }
    }
  }
  return singleValue;
};
const skip$2 = (source, count3) => {
  function* iterator() {
    let i2 = 0;
    for (const item of source) {
      if (i2++ >= count3) {
        yield item;
      }
    }
  }
  return new BasicEnumerable(iterator);
};
const skipWhile$2 = (source, predicate) => {
  if (predicate.length === 1) {
    return skipWhile1$1(source, predicate);
  } else {
    return skipWhile2$1(source, predicate);
  }
};
const skipWhile1$1 = (source, predicate) => {
  function* iterator() {
    let skip2 = true;
    for (const item of source) {
      if (skip2 === false) {
        yield item;
      } else if (predicate(item) === false) {
        skip2 = false;
        yield item;
      }
    }
  }
  return new BasicEnumerable(iterator);
};
const skipWhile2$1 = (source, predicate) => {
  function* iterator() {
    let index = 0;
    let skip2 = true;
    for (const item of source) {
      if (skip2 === false) {
        yield item;
      } else if (predicate(item, index) === false) {
        skip2 = false;
        yield item;
      }
      index++;
    }
  }
  return new BasicEnumerable(iterator);
};
const skipWhileAsync$2 = (source, predicate) => {
  if (predicate.length === 1) {
    return skipWhileAsync1$1(source, predicate);
  } else {
    return skipWhileAsync2$1(source, predicate);
  }
};
const skipWhileAsync1$1 = (source, predicate) => {
  async function* iterator() {
    let skip2 = true;
    for (const item of source) {
      if (skip2 === false) {
        yield item;
      } else if (await predicate(item) === false) {
        skip2 = false;
        yield item;
      }
    }
  }
  return fromAsync(iterator);
};
const skipWhileAsync2$1 = (source, predicate) => {
  async function* iterator() {
    let index = 0;
    let skip2 = true;
    for (const item of source) {
      if (skip2 === false) {
        yield item;
      } else if (await predicate(item, index) === false) {
        skip2 = false;
        yield item;
      }
      index++;
    }
  }
  return fromAsync(iterator);
};
const sum$2 = (source, selector) => {
  if (selector) {
    return sum2$2(source, selector);
  } else {
    return sum1$2(source);
  }
};
const sum1$2 = (source) => {
  let total = 0;
  for (const value of source) {
    total += value;
  }
  return total;
};
const sum2$2 = (source, selector) => {
  let total = 0;
  for (const value of source) {
    total += selector(value);
  }
  return total;
};
const sumAsync$2 = async (source, selector) => {
  let sum3 = 0;
  for (const value of source) {
    sum3 += await selector(value);
  }
  return sum3;
};
const take$2 = (source, amount) => {
  function* iterator() {
    let amountLeft = amount > 0 ? amount : 0;
    for (const item of source) {
      if (amountLeft-- === 0) {
        break;
      } else {
        yield item;
      }
    }
  }
  return new BasicEnumerable(iterator);
};
const takeWhile$2 = (source, predicate) => {
  if (predicate.length === 1) {
    return takeWhile1$1(source, predicate);
  } else {
    return takeWhile2$1(source, predicate);
  }
};
const takeWhile1$1 = (source, predicate) => {
  function* iterator() {
    for (const item of source) {
      if (predicate(item)) {
        yield item;
      } else {
        break;
      }
    }
  }
  return new BasicEnumerable(iterator);
};
const takeWhile2$1 = (source, predicate) => {
  function* iterator() {
    let index = 0;
    for (const item of source) {
      if (predicate(item, index++)) {
        yield item;
      } else {
        break;
      }
    }
  }
  return new BasicEnumerable(iterator);
};
const takeWhileAsync$2 = (source, predicate) => {
  if (predicate.length === 1) {
    return takeWhileAsync1$1(source, predicate);
  } else {
    return takeWhileAsync2$1(source, predicate);
  }
};
const takeWhileAsync1$1 = (source, predicate) => {
  async function* iterator() {
    for (const item of source) {
      if (await predicate(item)) {
        yield item;
      } else {
        break;
      }
    }
  }
  return fromAsync(iterator);
};
const takeWhileAsync2$1 = (source, predicate) => {
  async function* iterator() {
    let index = 0;
    for (const item of source) {
      if (await predicate(item, index++)) {
        yield item;
      } else {
        break;
      }
    }
  }
  return fromAsync(iterator);
};
const toArray$2 = (source) => {
  return [...source];
};
const toMap$2 = (source, selector) => {
  const map = /* @__PURE__ */ new Map();
  for (const value of source) {
    const key = selector(value);
    const array = map.get(key);
    if (array === void 0) {
      map.set(key, [value]);
    } else {
      array.push(value);
    }
  }
  return map;
};
const toMapAsync$2 = async (source, selector) => {
  const map = /* @__PURE__ */ new Map();
  for (const value of source) {
    const key = await selector(value);
    const array = map.get(key);
    if (array === void 0) {
      map.set(key, [value]);
    } else {
      array.push(value);
    }
  }
  return map;
};
const toObject$2 = (source, selector) => {
  const map = {};
  for (const value of source) {
    map[selector(value)] = value;
  }
  return map;
};
const toObjectAsync$2 = async (source, selector) => {
  const map = {};
  for (const value of source) {
    map[await selector(value)] = value;
  }
  return map;
};
const toSet$2 = (source) => {
  return new Set(source);
};
const union$2 = (first3, second, comparer) => {
  if (comparer) {
    return union2$2(first3, second, comparer);
  } else {
    return union1$2(first3, second);
  }
};
const union1$2 = (first3, second) => {
  function* iterator() {
    const set = /* @__PURE__ */ new Set();
    for (const item of first3) {
      if (set.has(item) === false) {
        yield item;
        set.add(item);
      }
    }
    for (const item of second) {
      if (set.has(item) === false) {
        yield item;
        set.add(item);
      }
    }
  }
  return new BasicEnumerable(iterator);
};
const union2$2 = (first3, second, comparer) => {
  function* iterator() {
    const result = [];
    for (const source of [first3, second]) {
      for (const value of source) {
        let exists = false;
        for (const resultValue of result) {
          if (comparer(value, resultValue) === true) {
            exists = true;
            break;
          }
        }
        if (exists === false) {
          yield value;
          result.push(value);
        }
      }
    }
  }
  return new BasicEnumerable(iterator);
};
const unionAsync$2 = (first3, second, comparer) => {
  async function* iterator() {
    const result = [];
    for (const source of [first3, second]) {
      for (const value of source) {
        let exists = false;
        for (const resultValue of result) {
          if (await comparer(value, resultValue) === true) {
            exists = true;
            break;
          }
        }
        if (exists === false) {
          yield value;
          result.push(value);
        }
      }
    }
  }
  return fromAsync(iterator);
};
const where$2 = (source, predicate) => {
  if (predicate.length === 1) {
    return where1$1(source, predicate);
  } else {
    return where2$1(source, predicate);
  }
};
const where1$1 = (source, predicate) => {
  function* iterator() {
    for (const item of source) {
      if (predicate(item) === true) {
        yield item;
      }
    }
  }
  return new BasicEnumerable(iterator);
};
const where2$1 = (source, predicate) => {
  function* iterator() {
    let i2 = 0;
    for (const item of source) {
      if (predicate(item, i2++) === true) {
        yield item;
      }
    }
  }
  return new BasicEnumerable(iterator);
};
const whereAsync$2 = (source, predicate) => {
  if (predicate.length === 1) {
    return whereAsync1$1(source, predicate);
  } else {
    return whereAsync2$1(source, predicate);
  }
};
const whereAsync1$1 = (source, predicate) => {
  async function* generator() {
    for (const item of source) {
      if (await predicate(item) === true) {
        yield item;
      }
    }
  }
  return fromAsync(generator);
};
const whereAsync2$1 = (source, predicate) => {
  async function* generator() {
    let i2 = 0;
    for (const item of source) {
      if (await predicate(item, i2++) === true) {
        yield item;
      }
    }
  }
  return fromAsync(generator);
};
const zip$2 = (source, second, resultSelector) => {
  if (resultSelector) {
    return zip2$2(source, second, resultSelector);
  } else {
    return zip1$2(source, second);
  }
};
const zip1$2 = (source, second) => {
  function* iterator() {
    const firstIterator = source[Symbol.iterator]();
    const secondIterator = second[Symbol.iterator]();
    while (true) {
      const a2 = firstIterator.next();
      const b2 = secondIterator.next();
      if (a2.done && b2.done) {
        break;
      } else {
        yield [a2.value, b2.value];
      }
    }
  }
  return new BasicEnumerable(iterator);
};
const zip2$2 = (source, second, resultSelector) => {
  function* iterator() {
    const firstIterator = source[Symbol.iterator]();
    const secondIterator = second[Symbol.iterator]();
    while (true) {
      const a2 = firstIterator.next();
      const b2 = secondIterator.next();
      if (a2.done && b2.done) {
        break;
      } else {
        yield resultSelector(a2.value, b2.value);
      }
    }
  }
  return new BasicEnumerable(iterator);
};
const zipAsync$2 = (first3, second, resultSelector) => {
  async function* generator() {
    const firstIterator = first3[Symbol.iterator]();
    const secondIterator = second[Symbol.iterator]();
    while (true) {
      const a2 = firstIterator.next();
      const b2 = secondIterator.next();
      if (a2.done && b2.done) {
        break;
      } else {
        yield resultSelector(a2.value, b2.value);
      }
    }
  }
  return fromAsync(generator);
};
const bindLinq = (object) => {
  const prototype = object.prototype;
  const bind = (func, key) => {
    const wrapped = function(...params) {
      return func(this, ...params);
    };
    Object.defineProperty(wrapped, "length", { value: func.length - 1 });
    prototype[key] = wrapped;
  };
  bind(aggregate$2, "Aggregate");
  bind(all$2, "All");
  bind(allAsync$2, "AllAsync");
  bind(any$2, "Any");
  bind(anyAsync$2, "AnyAsync");
  bind(asAsync$1, "AsAsync");
  bind(asParallel$1, "AsParallel");
  bind(average$2, "Average");
  bind(averageAsync$2, "AverageAsync");
  bind(concatenate$2, "Concatenate");
  bind(contains$2, "Contains");
  bind(containsAsync$2, "ContainsAsync");
  bind(count$2, "Count");
  bind(countAsync$2, "CountAsync");
  bind(distinct$2, "Distinct");
  bind(distinctAsync$2, "DistinctAsync");
  bind(each$2, "Each");
  bind(eachAsync$2, "EachAsync");
  bind(elementAt$2, "ElementAt");
  bind(elementAtOrDefault$2, "ElementAtOrDefault");
  bind(except$2, "Except");
  bind(exceptAsync$2, "ExceptAsync");
  bind(first$2, "First");
  bind(firstAsync$2, "FirstAsync");
  bind(firstOrDefault$2, "FirstOrDefault");
  bind(firstOrDefaultAsync$2, "FirstOrDefaultAsync");
  bind(groupBy$2, "GroupBy");
  bind(groupByAsync$2, "GroupByAsync");
  bind(groupByWithSel$2, "GroupByWithSel");
  bind(intersect$2, "Intersect");
  bind(intersectAsync$2, "IntersectAsync");
  bind(join$2, "JoinByKey");
  bind(last$2, "Last");
  bind(lastAsync$2, "LastAsync");
  bind(lastOrDefault$2, "LastOrDefault");
  bind(lastOrDefaultAsync$2, "LastOrDefaultAsync");
  bind(max$2, "Max");
  bind(maxAsync$2, "MaxAsync");
  bind(min$2, "Min");
  bind(minAsync$2, "MinAsync");
  bind(ofType$2, "OfType");
  bind(orderBy$2, "OrderBy");
  bind(orderByAsync$2, "OrderByAsync");
  bind(orderByDescending$2, "OrderByDescending");
  bind(orderByDescendingAsync$2, "OrderByDescendingAsync");
  bind(reverse$2, "Reverse");
  bind(select$2, "Select");
  bind(selectAsync$2, "SelectAsync");
  bind(selectMany$2, "SelectMany");
  bind(selectManyAsync$2, "SelectManyAsync");
  bind(sequenceEquals$2, "SequenceEquals");
  bind(sequenceEqualsAsync$2, "SequenceEqualsAsync");
  bind(single$2, "Single");
  bind(singleAsync$2, "SingleAsync");
  bind(singleOrDefault$2, "SingleOrDefault");
  bind(singleOrDefaultAsync$2, "SingleOrDefaultAsync");
  bind(skip$2, "Skip");
  bind(skipWhile$2, "SkipWhile");
  bind(skipWhileAsync$2, "SkipWhileAsync");
  bind(sum$2, "Sum");
  bind(sumAsync$2, "SumAsync");
  bind(take$2, "Take");
  bind(takeWhile$2, "TakeWhile");
  bind(takeWhileAsync$2, "TakeWhileAsync");
  bind(toArray$2, "ToArray");
  bind(toMap$2, "ToMap");
  bind(toMapAsync$2, "ToMapAsync");
  bind(toObject$2, "ToObject");
  bind(toObjectAsync$2, "ToObjectAsync");
  bind(partition$2, "Partition");
  bind(partitionAsync$2, "PartitionAsync");
  bind(toSet$2, "ToSet");
  bind(union$2, "Union");
  bind(unionAsync$2, "UnionAsync");
  bind(where$2, "Where");
  bind(whereAsync$2, "WhereAsync");
  bind(zip$2, "Zip");
  bind(zipAsync$2, "ZipAsync");
};
const aggregate$1 = (source, seedOrFunc, func, resultSelector) => {
  if (resultSelector) {
    if (!func) {
      throw new ReferenceError(`TAccumulate function is undefined`);
    }
    return aggregate3$1(source, seedOrFunc, func, resultSelector);
  } else if (func) {
    return aggregate2$1(source, seedOrFunc, func);
  } else {
    return aggregate1$1(source, seedOrFunc);
  }
};
const aggregate1$1 = async (source, func) => {
  let aggregateValue;
  for await (const value of source) {
    if (aggregateValue) {
      aggregateValue = func(aggregateValue, value);
    } else {
      aggregateValue = value;
    }
  }
  if (aggregateValue === void 0) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return aggregateValue;
};
const aggregate2$1 = async (source, seed, func) => {
  let aggregateValue = seed;
  for await (const value of source) {
    aggregateValue = func(aggregateValue, value);
  }
  return aggregateValue;
};
const aggregate3$1 = async (source, seed, func, resultSelector) => {
  let aggregateValue = seed;
  for await (const value of source) {
    aggregateValue = func(aggregateValue, value);
  }
  return resultSelector(aggregateValue);
};
const all$1 = async (source, predicate) => {
  for await (const item of source) {
    if (predicate(item) === false) {
      return false;
    }
  }
  return true;
};
const allAsync$1 = async (source, predicate) => {
  for await (const item of source) {
    if (await predicate(item) === false) {
      return false;
    }
  }
  return true;
};
const any$1 = (source, predicate) => {
  if (predicate) {
    return any2$1(source, predicate);
  } else {
    return any1$1(source);
  }
};
const any1$1 = async (source) => {
  for await (const _ of source) {
    return true;
  }
  return false;
};
const any2$1 = async (source, predicate) => {
  for await (const item of source) {
    if (predicate(item) === true) {
      return true;
    }
  }
  return false;
};
const anyAsync$1 = async (source, predicate) => {
  for await (const item of source) {
    if (await predicate(item) === true) {
      return true;
    }
  }
  return false;
};
const asParallel = (source) => {
  const generator = async () => {
    const data = [];
    for await (const value of source) {
      data.push(value);
    }
    return data;
  };
  return fromParallel(ParallelGeneratorType.PromiseToArray, generator);
};
const average$1 = (source, selector) => {
  if (selector) {
    return average2(source, selector);
  } else {
    return average1(source);
  }
};
const average1 = async (source) => {
  let value;
  let count3;
  for await (const item of source) {
    value = (value || 0) + item;
    count3 = (count3 || 0) + 1;
  }
  if (value === void 0) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return value / count3;
};
const average2 = async (source, func) => {
  let value;
  let count3;
  for await (const item of source) {
    value = (value || 0) + func(item);
    count3 = (count3 || 0) + 1;
  }
  if (value === void 0) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return value / count3;
};
const averageAsync$1 = async (source, selector) => {
  let value;
  let count3;
  for await (const item of source) {
    value = (value || 0) + await selector(item);
    count3 = (count3 || 0) + 1;
  }
  if (value === void 0) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return value / count3;
};
const concatenate$1 = (first3, second) => {
  async function* iterator() {
    yield* first3;
    yield* second;
  }
  return new BasicAsyncEnumerable(iterator);
};
const contains$1 = async (source, value, comparer = StrictEqualityComparer) => {
  for await (const item of source) {
    if (comparer(value, item)) {
      return true;
    }
  }
  return false;
};
const containsAsync$1 = async (source, value, comparer) => {
  for await (const item of source) {
    if (await comparer(value, item)) {
      return true;
    }
  }
  return false;
};
const count$1 = (source, predicate) => {
  if (predicate) {
    return count2$1(source, predicate);
  } else {
    return count1$1(source);
  }
};
const count1$1 = async (source) => {
  let total = 0;
  for await (const _ of source) {
    total++;
  }
  return total;
};
const count2$1 = async (source, predicate) => {
  let total = 0;
  for await (const value of source) {
    if (predicate(value) === true) {
      total++;
    }
  }
  return total;
};
const countAsync$1 = async (source, predicate) => {
  let count3 = 0;
  for await (const value of source) {
    if (await predicate(value) === true) {
      count3++;
    }
  }
  return count3;
};
const distinct$1 = (source, comparer = StrictEqualityComparer) => {
  async function* iterator() {
    const distinctElements = [];
    for await (const item of source) {
      const foundItem = distinctElements.find((x) => comparer(x, item));
      if (!foundItem) {
        distinctElements.push(item);
        yield item;
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const distinctAsync$1 = (source, comparer) => {
  async function* iterator() {
    const distinctElements = [];
    outerLoop:
      for await (const item of source) {
        for (const distinctElement of distinctElements) {
          const found = await comparer(distinctElement, item);
          if (found) {
            continue outerLoop;
          }
        }
        distinctElements.push(item);
        yield item;
      }
  }
  return new BasicAsyncEnumerable(iterator);
};
const each$1 = (source, action) => {
  async function* iterator() {
    for await (const value of source) {
      action(value);
      yield value;
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const eachAsync$1 = (source, action) => {
  async function* iterator() {
    for await (const value of source) {
      await action(value);
      yield value;
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const elementAt$1 = async (source, index) => {
  if (index < 0) {
    throw new ArgumentOutOfRangeException("index");
  }
  let i2 = 0;
  for await (const item of source) {
    if (index === i2++) {
      return item;
    }
  }
  throw new ArgumentOutOfRangeException("index");
};
const elementAtOrDefault$1 = async (source, index) => {
  let i2 = 0;
  for await (const item of source) {
    if (index === i2++) {
      return item;
    }
  }
  return null;
};
const except$1 = (first3, second, comparer = StrictEqualityComparer) => {
  async function* iterator() {
    const secondArray = [];
    for await (const x of second) {
      secondArray.push(x);
    }
    for await (const firstItem of first3) {
      let exists = false;
      for (let j = 0; j < secondArray.length; j++) {
        const secondItem = secondArray[j];
        if (comparer(firstItem, secondItem) === true) {
          exists = true;
          break;
        }
      }
      if (exists === false) {
        yield firstItem;
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const exceptAsync$1 = (first3, second, comparer) => {
  async function* iterator() {
    const secondArray = [];
    for await (const x of second) {
      secondArray.push(x);
    }
    for await (const firstItem of first3) {
      let exists = false;
      for (let j = 0; j < secondArray.length; j++) {
        const secondItem = secondArray[j];
        if (await comparer(firstItem, secondItem) === true) {
          exists = true;
          break;
        }
      }
      if (exists === false) {
        yield firstItem;
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const first$1 = (source, predicate) => {
  if (predicate) {
    return first2$1(source, predicate);
  } else {
    return first1$1(source);
  }
};
const first1$1 = async (source) => {
  const firstElement = await source[Symbol.asyncIterator]().next();
  if (firstElement.done === true) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return firstElement.value;
};
const first2$1 = async (source, predicate) => {
  for await (const value of source) {
    if (predicate(value) === true) {
      return value;
    }
  }
  throw new InvalidOperationException(ErrorString.NoMatch);
};
const firstAsync$1 = async (source, predicate) => {
  for await (const value of source) {
    if (await predicate(value) === true) {
      return value;
    }
  }
  throw new InvalidOperationException(ErrorString.NoMatch);
};
const firstOrDefault$1 = (source, predicate) => {
  if (predicate) {
    return firstOrDefault2$1(source, predicate);
  } else {
    return firstOrDefault1$1(source);
  }
};
const firstOrDefault1$1 = async (source) => {
  const first3 = await source[Symbol.asyncIterator]().next();
  return first3.value || null;
};
const firstOrDefault2$1 = async (source, predicate) => {
  for await (const value of source) {
    if (predicate(value) === true) {
      return value;
    }
  }
  return null;
};
const firstOrDefaultAsync$1 = async (source, predicate) => {
  for await (const value of source) {
    if (await predicate(value) === true) {
      return value;
    }
  }
  return null;
};
const groupBy$1 = (source, keySelector, comparer) => {
  if (comparer) {
    return groupBy_0$1(source, keySelector, comparer);
  } else {
    return groupBy_0_Simple$1(source, keySelector);
  }
};
const groupBy_0$1 = (source, keySelector, comparer) => {
  async function* generate() {
    const keyMap = new Array();
    for await (const value of source) {
      const key = keySelector(value);
      let found = false;
      for (let i2 = 0; i2 < keyMap.length; i2++) {
        const group = keyMap[i2];
        if (comparer(group.key, key)) {
          group.push(value);
          found = true;
          break;
        }
      }
      if (found === false) {
        keyMap.push(new Grouping(key, value));
      }
    }
    for (const g2 of keyMap) {
      yield g2;
    }
  }
  return new BasicAsyncEnumerable(generate);
};
const groupBy_0_Simple$1 = (source, keySelector) => {
  async function* iterator() {
    const keyMap = {};
    for await (const value of source) {
      const key = keySelector(value);
      const grouping = keyMap[key];
      if (grouping) {
        grouping.push(value);
      } else {
        keyMap[key] = new Grouping(key, value);
      }
    }
    for (const value in keyMap) {
      yield keyMap[value];
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const groupByAsync$1 = (source, keySelector, comparer) => {
  if (comparer) {
    return groupByAsync_0$1(source, keySelector, comparer);
  } else {
    return groupByAsync_0_Simple$1(source, keySelector);
  }
};
const groupByAsync_0_Simple$1 = (source, keySelector) => {
  async function* iterator() {
    const keyMap = {};
    for await (const value of source) {
      const key = await keySelector(value);
      const grouping = keyMap[key];
      if (grouping) {
        grouping.push(value);
      } else {
        keyMap[key] = new Grouping(key, value);
      }
    }
    for (const value in keyMap) {
      yield keyMap[value];
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const groupByAsync_0$1 = (source, keySelector, comparer) => {
  async function* generate() {
    const keyMap = new Array();
    for await (const value of source) {
      const key = await keySelector(value);
      let found = false;
      for (let i2 = 0; i2 < keyMap.length; i2++) {
        const group = keyMap[i2];
        if (await comparer(group.key, key) === true) {
          group.push(value);
          found = true;
          break;
        }
      }
      if (found === false) {
        keyMap.push(new Grouping(key, value));
      }
    }
    for (const keyValue of keyMap) {
      yield keyValue;
    }
  }
  return new BasicAsyncEnumerable(generate);
};
const groupByWithSel$1 = (source, keySelector, elementSelector, comparer) => {
  if (comparer) {
    return groupBy1$1(source, keySelector, elementSelector, comparer);
  } else {
    return groupBy1Simple$1(source, keySelector, elementSelector);
  }
};
const groupBy1Simple$1 = (source, keySelector, elementSelector) => {
  async function* generate() {
    const keyMap = {};
    for await (const value of source) {
      const key = keySelector(value);
      const grouping = keyMap[key];
      const element = elementSelector(value);
      if (grouping) {
        grouping.push(element);
      } else {
        keyMap[key] = new Grouping(key, element);
      }
    }
    for (const value in keyMap) {
      yield keyMap[value];
    }
  }
  return new BasicAsyncEnumerable(generate);
};
const groupBy1$1 = (source, keySelector, elementSelector, comparer) => {
  async function* generate() {
    const keyMap = new Array();
    for await (const value of source) {
      const key = keySelector(value);
      let found = false;
      for (let i2 = 0; i2 < keyMap.length; i2++) {
        const group = keyMap[i2];
        if (comparer(group.key, key)) {
          group.push(elementSelector(value));
          found = true;
          break;
        }
      }
      if (found === false) {
        const element = elementSelector(value);
        keyMap.push(new Grouping(key, element));
      }
    }
    for (const value of keyMap) {
      yield value;
    }
  }
  return new BasicAsyncEnumerable(generate);
};
const intersect$1 = (first3, second, comparer = StrictEqualityComparer) => {
  async function* iterator() {
    const firstResults = await first3.Distinct(comparer).ToArray();
    if (firstResults.length === 0) {
      return;
    }
    const secondResults = await second.ToArray();
    for (let i2 = 0; i2 < firstResults.length; i2++) {
      const firstValue = firstResults[i2];
      for (let j = 0; j < secondResults.length; j++) {
        const secondValue = secondResults[j];
        if (comparer(firstValue, secondValue) === true) {
          yield firstValue;
          break;
        }
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const intersectAsync$1 = (first3, second, comparer) => {
  async function* iterator() {
    const firstResults = await first3.DistinctAsync(comparer).ToArray();
    if (firstResults.length === 0) {
      return;
    }
    const secondResults = await second.ToArray();
    for (let i2 = 0; i2 < firstResults.length; i2++) {
      const firstValue = firstResults[i2];
      for (let j = 0; j < secondResults.length; j++) {
        const secondValue = secondResults[j];
        if (await comparer(firstValue, secondValue) === true) {
          yield firstValue;
          break;
        }
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const join$1 = (outer, inner, outerKeySelector, innerKeySelector, resultSelector, comparer = StrictEqualityComparer) => {
  async function* iterator() {
    const innerArray = [];
    for await (const i2 of inner) {
      innerArray.push(i2);
    }
    for await (const o2 of outer) {
      const outerKey = outerKeySelector(o2);
      for (const i2 of innerArray) {
        const innerKey = innerKeySelector(i2);
        if (comparer(outerKey, innerKey) === true) {
          yield resultSelector(o2, i2);
        }
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const last$1 = (source, predicate) => {
  if (predicate) {
    return last2$1(source, predicate);
  } else {
    return last1$1(source);
  }
};
const last1$1 = async (source) => {
  let lastItem = null;
  for await (const value of source) {
    lastItem = value;
  }
  if (!lastItem) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return lastItem;
};
const last2$1 = async (source, predicate) => {
  let lastItem = null;
  for await (const value of source) {
    if (predicate(value) === true) {
      lastItem = value;
    }
  }
  if (!lastItem) {
    throw new InvalidOperationException(ErrorString.NoMatch);
  }
  return lastItem;
};
const lastAsync$1 = async (source, predicate) => {
  let last3 = null;
  for await (const value of source) {
    if (await predicate(value) === true) {
      last3 = value;
    }
  }
  if (!last3) {
    throw new InvalidOperationException(ErrorString.NoMatch);
  }
  return last3;
};
const lastOrDefault$1 = (source, predicate) => {
  if (predicate) {
    return lastOrDefault2$1(source, predicate);
  } else {
    return lastOrDefault1$1(source);
  }
};
const lastOrDefault1$1 = async (source) => {
  let last3 = null;
  for await (const value of source) {
    last3 = value;
  }
  return last3;
};
const lastOrDefault2$1 = async (source, predicate) => {
  let last3 = null;
  for await (const value of source) {
    if (predicate(value) === true) {
      last3 = value;
    }
  }
  return last3;
};
const lastOrDefaultAsync$1 = async (source, predicate) => {
  let last3 = null;
  for await (const value of source) {
    if (await predicate(value) === true) {
      last3 = value;
    }
  }
  return last3;
};
const max$1 = (source, selector) => {
  if (selector) {
    return max2(source, selector);
  } else {
    return max1(source);
  }
};
const max1 = async (source) => {
  let maxItem = null;
  for await (const item of source) {
    maxItem = Math.max(maxItem || Number.NEGATIVE_INFINITY, item);
  }
  if (maxItem === null) {
    throw new InvalidOperationException(ErrorString.NoElements);
  } else {
    return maxItem;
  }
};
const max2 = async (source, selector) => {
  let maxItem = null;
  for await (const item of source) {
    maxItem = Math.max(maxItem || Number.NEGATIVE_INFINITY, selector(item));
  }
  if (maxItem === null) {
    throw new InvalidOperationException(ErrorString.NoElements);
  } else {
    return maxItem;
  }
};
const maxAsync$1 = async (source, selector) => {
  let max3 = null;
  for await (const item of source) {
    max3 = Math.max(max3 || Number.NEGATIVE_INFINITY, await selector(item));
  }
  if (max3 === null) {
    throw new InvalidOperationException(ErrorString.NoElements);
  } else {
    return max3;
  }
};
const min$1 = (source, selector) => {
  if (selector) {
    return min2(source, selector);
  } else {
    return min1(source);
  }
};
const min1 = async (source) => {
  let minValue = null;
  for await (const item of source) {
    minValue = Math.min(minValue || Number.POSITIVE_INFINITY, item);
  }
  if (minValue === null) {
    throw new InvalidOperationException(ErrorString.NoElements);
  } else {
    return minValue;
  }
};
const min2 = async (source, selector) => {
  let minValue = null;
  for await (const item of source) {
    minValue = Math.min(minValue || Number.POSITIVE_INFINITY, selector(item));
  }
  if (minValue === null) {
    throw new InvalidOperationException(ErrorString.NoElements);
  } else {
    return minValue;
  }
};
const minAsync$1 = async (source, selector) => {
  let min3 = null;
  for await (const item of source) {
    min3 = Math.min(min3 || Number.POSITIVE_INFINITY, await selector(item));
  }
  if (min3 === null) {
    throw new InvalidOperationException(ErrorString.NoElements);
  } else {
    return min3;
  }
};
const ofType$1 = (source, type) => {
  const typeCheck = typeof type === "string" ? (x) => typeof x === type : (x) => x instanceof type;
  async function* iterator() {
    for await (const item of source) {
      if (typeCheck(item)) {
        yield item;
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const orderBy$1 = (source, keySelector, comparer) => {
  return OrderedAsyncEnumerable.generate(source, keySelector, true, comparer);
};
const orderByAsync$1 = (source, keySelector, comparer) => {
  return OrderedAsyncEnumerable.generateAsync(source, keySelector, true, comparer);
};
const orderByDescending$1 = (source, keySelector, comparer) => {
  return OrderedAsyncEnumerable.generate(source, keySelector, false, comparer);
};
const orderByDescendingAsync$1 = (source, keySelector, comparer) => {
  return OrderedAsyncEnumerable.generateAsync(source, keySelector, false, comparer);
};
const partition$1 = async (source, predicate) => {
  const fail = [];
  const pass = [];
  for await (const value of source) {
    if (predicate(value) === true) {
      pass.push(value);
    } else {
      fail.push(value);
    }
  }
  return [pass, fail];
};
const partitionAsync$1 = async (source, predicate) => {
  const fail = [];
  const pass = [];
  for await (const value of source) {
    if (await predicate(value) === true) {
      pass.push(value);
    } else {
      fail.push(value);
    }
  }
  return [pass, fail];
};
const reverse$1 = (source) => {
  async function* iterator() {
    const values = [];
    for await (const value of source) {
      values.push(value);
    }
    for (let i2 = values.length - 1; i2 >= 0; i2--) {
      yield values[i2];
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const select$1 = (source, selector) => {
  if (typeof selector === "function") {
    if (selector.length === 1) {
      return select1(source, selector);
    } else {
      return select2(source, selector);
    }
  } else {
    return select3(source, selector);
  }
};
const select1 = (source, selector) => {
  async function* iterator() {
    for await (const value of source) {
      yield selector(value);
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const select2 = (source, selector) => {
  async function* iterator() {
    let index = 0;
    for await (const value of source) {
      yield selector(value, index);
      index++;
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const select3 = (source, key) => {
  async function* iterator() {
    for await (const value of source) {
      yield value[key];
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const selectAsync$1 = (source, selector) => {
  if (typeof selector === "string") {
    return selectAsync2(source, selector);
  } else {
    return selectAsync1(source, selector);
  }
};
const selectAsync1 = (source, selector) => {
  async function* iterator() {
    for await (const value of source) {
      yield selector(value);
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const selectAsync2 = (source, key) => {
  async function* iterator() {
    for await (const value of source) {
      yield value[key];
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const selectMany$1 = (source, selector) => {
  if (typeof selector === "function") {
    if (selector.length === 1) {
      return selectMany1(source, selector);
    } else {
      return selectMany2(source, selector);
    }
  } else {
    return selectMany3(source, selector);
  }
};
const selectMany1 = (source, selector) => {
  async function* iterator() {
    for await (const value of source) {
      for (const selectorValue of selector(value)) {
        yield selectorValue;
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const selectMany2 = (source, selector) => {
  async function* iterator() {
    let index = 0;
    for await (const value of source) {
      for (const selectorValue of selector(value, index)) {
        yield selectorValue;
      }
      index++;
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const selectMany3 = (source, selector) => {
  async function* iterator() {
    for await (const value of source) {
      for (const selectorValue of value[selector]) {
        yield selectorValue;
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const selectManyAsync$1 = (source, selector) => {
  if (selector.length === 1) {
    const iterator = async function* () {
      for await (const value of source) {
        const many = await selector(value);
        for (const innerValue of many) {
          yield innerValue;
        }
      }
    };
    return new BasicAsyncEnumerable(iterator);
  } else {
    const iterator = async function* () {
      let index = 0;
      for await (const value of source) {
        const many = await selector(value, index);
        for (const innerValue of many) {
          yield innerValue;
        }
        index++;
      }
    };
    return new BasicAsyncEnumerable(iterator);
  }
};
const sequenceEquals$1 = async (first3, second, comparer = StrictEqualityComparer) => {
  const firstIterator = first3[Symbol.asyncIterator]();
  const secondIterator = second[Symbol.asyncIterator]();
  let results = await Promise.all([firstIterator.next(), secondIterator.next()]);
  let firstResult = results[0];
  let secondResult = results[1];
  while (!firstResult.done && !secondResult.done) {
    if (!comparer(firstResult.value, secondResult.value)) {
      return false;
    }
    results = await Promise.all([firstIterator.next(), secondIterator.next()]);
    firstResult = results[0];
    secondResult = results[1];
  }
  return firstResult.done === true && secondResult.done === true;
};
const sequenceEqualsAsync$1 = async (first3, second, comparer) => {
  const firstIterator = first3[Symbol.asyncIterator]();
  const secondIterator = second[Symbol.asyncIterator]();
  let results = await Promise.all([firstIterator.next(), secondIterator.next()]);
  let firstResult = results[0];
  let secondResult = results[1];
  while (!firstResult.done && !secondResult.done) {
    if (await comparer(firstResult.value, secondResult.value) === false) {
      return false;
    }
    results = await Promise.all([firstIterator.next(), secondIterator.next()]);
    firstResult = results[0];
    secondResult = results[1];
  }
  return firstResult.done === true && secondResult.done === true;
};
const single$1 = (source, predicate) => {
  if (predicate) {
    return single2$1(source, predicate);
  } else {
    return single1$1(source);
  }
};
const single1$1 = async (source) => {
  let hasValue = false;
  let singleValue = null;
  for await (const value of source) {
    if (hasValue === true) {
      throw new InvalidOperationException(ErrorString.MoreThanOneElement);
    } else {
      hasValue = true;
      singleValue = value;
    }
  }
  if (hasValue === false) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return singleValue;
};
const single2$1 = async (source, predicate) => {
  let hasValue = false;
  let singleValue = null;
  for await (const value of source) {
    if (predicate(value)) {
      if (hasValue === true) {
        throw new InvalidOperationException(ErrorString.MoreThanOneMatchingElement);
      } else {
        hasValue = true;
        singleValue = value;
      }
    }
  }
  if (hasValue === false) {
    throw new InvalidOperationException(ErrorString.NoMatch);
  }
  return singleValue;
};
const singleAsync$1 = async (source, predicate) => {
  let hasValue = false;
  let singleValue = null;
  for await (const value of source) {
    if (await predicate(value)) {
      if (hasValue === true) {
        throw new InvalidOperationException(ErrorString.MoreThanOneMatchingElement);
      } else {
        hasValue = true;
        singleValue = value;
      }
    }
  }
  if (hasValue === false) {
    throw new InvalidOperationException(ErrorString.NoMatch);
  }
  return singleValue;
};
const singleOrDefault$1 = (source, predicate) => {
  if (predicate) {
    return singleOrDefault2$1(source, predicate);
  } else {
    return singleOrDefault1$1(source);
  }
};
const singleOrDefault1$1 = async (source) => {
  let hasValue = false;
  let singleValue = null;
  for await (const value of source) {
    if (hasValue === true) {
      throw new InvalidOperationException(ErrorString.MoreThanOneElement);
    } else {
      hasValue = true;
      singleValue = value;
    }
  }
  return singleValue;
};
const singleOrDefault2$1 = async (source, predicate) => {
  let hasValue = false;
  let singleValue = null;
  for await (const value of source) {
    if (predicate(value)) {
      if (hasValue === true) {
        throw new InvalidOperationException(ErrorString.MoreThanOneMatchingElement);
      } else {
        hasValue = true;
        singleValue = value;
      }
    }
  }
  return singleValue;
};
const singleOrDefaultAsync$1 = async (source, predicate) => {
  let hasValue = false;
  let singleValue = null;
  for await (const value of source) {
    if (await predicate(value)) {
      if (hasValue === true) {
        throw new InvalidOperationException(ErrorString.MoreThanOneMatchingElement);
      } else {
        hasValue = true;
        singleValue = value;
      }
    }
  }
  return singleValue;
};
const skip$1 = (source, count3) => {
  async function* iterator() {
    let i2 = 0;
    for await (const item of source) {
      if (i2++ >= count3) {
        yield item;
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const skipWhile$1 = (source, predicate) => {
  if (predicate.length === 1) {
    return skipWhile1(source, predicate);
  } else {
    return skipWhile2(source, predicate);
  }
};
const skipWhile1 = (source, predicate) => {
  async function* iterator() {
    let skip2 = true;
    for await (const item of source) {
      if (skip2 === false) {
        yield item;
      } else if (predicate(item) === false) {
        skip2 = false;
        yield item;
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const skipWhile2 = (source, predicate) => {
  async function* iterator() {
    let index = 0;
    let skip2 = true;
    for await (const item of source) {
      if (skip2 === false) {
        yield item;
      } else if (predicate(item, index) === false) {
        skip2 = false;
        yield item;
      }
      index++;
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const skipWhileAsync$1 = (source, predicate) => {
  if (predicate.length === 1) {
    return skipWhileAsync1(source, predicate);
  } else {
    return skipWhileAsync2(source, predicate);
  }
};
const skipWhileAsync1 = (source, predicate) => {
  async function* iterator() {
    let skip2 = true;
    for await (const item of source) {
      if (skip2 === false) {
        yield item;
      } else if (await predicate(item) === false) {
        skip2 = false;
        yield item;
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const skipWhileAsync2 = (source, predicate) => {
  async function* iterator() {
    let index = 0;
    let skip2 = true;
    for await (const item of source) {
      if (skip2 === false) {
        yield item;
      } else if (await predicate(item, index) === false) {
        skip2 = false;
        yield item;
      }
      index++;
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const sum$1 = (source, selector) => {
  if (selector) {
    return sum2$1(source, selector);
  } else {
    return sum1$1(source);
  }
};
const sum1$1 = async (source) => {
  let total = 0;
  for await (const value of source) {
    total += value;
  }
  return total;
};
const sum2$1 = async (source, selector) => {
  let total = 0;
  for await (const value of source) {
    total += selector(value);
  }
  return total;
};
const sumAsync$1 = async (source, selector) => {
  let sum3 = 0;
  for await (const value of source) {
    sum3 += await selector(value);
  }
  return sum3;
};
const take$1 = (source, amount) => {
  async function* iterator() {
    let amountLeft = amount > 0 ? amount : 0;
    for await (const item of source) {
      if (amountLeft-- === 0) {
        break;
      } else {
        yield item;
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const takeWhile$1 = (source, predicate) => {
  if (predicate.length === 1) {
    return takeWhile1(source, predicate);
  } else {
    return takeWhile2(source, predicate);
  }
};
const takeWhile1 = (source, predicate) => {
  async function* iterator() {
    for await (const item of source) {
      if (predicate(item)) {
        yield item;
      } else {
        break;
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const takeWhile2 = (source, predicate) => {
  async function* iterator() {
    let index = 0;
    for await (const item of source) {
      if (predicate(item, index++)) {
        yield item;
      } else {
        break;
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const takeWhileAsync$1 = (source, predicate) => {
  if (predicate.length === 1) {
    return takeWhileAsync1(source, predicate);
  } else {
    return takeWhileAsync2(source, predicate);
  }
};
const takeWhileAsync1 = (source, predicate) => {
  async function* iterator() {
    for await (const item of source) {
      if (await predicate(item)) {
        yield item;
      } else {
        break;
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const takeWhileAsync2 = (source, predicate) => {
  async function* iterator() {
    let index = 0;
    for await (const item of source) {
      if (await predicate(item, index++)) {
        yield item;
      } else {
        break;
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const toArray$1 = async (source) => {
  const array = [];
  for await (const item of source) {
    array.push(item);
  }
  return array;
};
const toMap$1 = async (source, selector) => {
  const map = /* @__PURE__ */ new Map();
  for await (const value of source) {
    const key = selector(value);
    const array = map.get(key);
    if (array === void 0) {
      map.set(key, [value]);
    } else {
      array.push(value);
    }
  }
  return map;
};
const toMapAsync$1 = async (source, selector) => {
  const map = /* @__PURE__ */ new Map();
  for await (const value of source) {
    const key = await selector(value);
    const array = map.get(key);
    if (array === void 0) {
      map.set(key, [value]);
    } else {
      array.push(value);
    }
  }
  return map;
};
const toObject$1 = async (source, selector) => {
  const map = {};
  for await (const value of source) {
    map[selector(value)] = value;
  }
  return map;
};
const toObjectAsync$1 = async (source, selector) => {
  const map = {};
  for await (const value of source) {
    map[await selector(value)] = value;
  }
  return map;
};
const toSet$1 = async (source) => {
  const set = /* @__PURE__ */ new Set();
  for await (const item of source) {
    set.add(item);
  }
  return set;
};
const union$1 = (first3, second, comparer) => {
  if (comparer) {
    return union2$1(first3, second, comparer);
  } else {
    return union1$1(first3, second);
  }
};
const union1$1 = (first3, second) => {
  async function* iterator() {
    const set = /* @__PURE__ */ new Set();
    for await (const item of first3) {
      if (set.has(item) === false) {
        yield item;
        set.add(item);
      }
    }
    for await (const item of second) {
      if (set.has(item) === false) {
        yield item;
        set.add(item);
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const union2$1 = (first3, second, comparer) => {
  async function* iterator() {
    const result = [];
    for (const source of [first3, second]) {
      for await (const value of source) {
        let exists = false;
        for (const resultValue of result) {
          if (comparer(value, resultValue) === true) {
            exists = true;
            break;
          }
        }
        if (exists === false) {
          yield value;
          result.push(value);
        }
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const unionAsync$1 = (first3, second, comparer) => {
  async function* iterator() {
    const result = [];
    for (const source of [first3, second]) {
      for await (const value of source) {
        let exists = false;
        for (const resultValue of result) {
          if (await comparer(value, resultValue) === true) {
            exists = true;
            break;
          }
        }
        if (exists === false) {
          yield value;
          result.push(value);
        }
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const where$1 = (source, predicate) => {
  if (predicate.length === 1) {
    return where1(source, predicate);
  } else {
    return where2(source, predicate);
  }
};
const where1 = (source, predicate) => {
  async function* iterator() {
    for await (const item of source) {
      if (predicate(item) === true) {
        yield item;
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const where2 = (source, predicate) => {
  async function* iterator() {
    let i2 = 0;
    for await (const item of source) {
      if (predicate(item, i2++) === true) {
        yield item;
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const whereAsync$1 = (source, predicate) => {
  if (predicate.length === 1) {
    return whereAsync1(source, predicate);
  } else {
    return whereAsync2(source, predicate);
  }
};
const whereAsync1 = (source, predicate) => {
  async function* iterator() {
    for await (const item of source) {
      if (await predicate(item) === true) {
        yield item;
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const whereAsync2 = (source, predicate) => {
  async function* iterator() {
    let i2 = 0;
    for await (const item of source) {
      if (await predicate(item, i2++) === true) {
        yield item;
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const zip$1 = (first3, second, resultSelector) => {
  if (resultSelector) {
    return zip2$1(first3, second, resultSelector);
  } else {
    return zip1$1(first3, second);
  }
};
const zip1$1 = (source, second) => {
  async function* iterator() {
    const firstIterator = source[Symbol.asyncIterator]();
    const secondIterator = second[Symbol.asyncIterator]();
    while (true) {
      const result = await Promise.all([firstIterator.next(), secondIterator.next()]);
      const a2 = result[0];
      const b2 = result[1];
      if (a2.done && b2.done) {
        break;
      } else {
        yield [a2.value, b2.value];
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const zip2$1 = (source, second, resultSelector) => {
  async function* iterator() {
    const firstIterator = source[Symbol.asyncIterator]();
    const secondIterator = second[Symbol.asyncIterator]();
    while (true) {
      const result = await Promise.all([firstIterator.next(), secondIterator.next()]);
      const a2 = result[0];
      const b2 = result[1];
      if (a2.done && b2.done) {
        break;
      } else {
        yield resultSelector(a2.value, b2.value);
      }
    }
  }
  return new BasicAsyncEnumerable(iterator);
};
const zipAsync$1 = (first3, second, resultSelector) => {
  async function* generator() {
    const firstIterator = first3[Symbol.asyncIterator]();
    const secondIterator = second[Symbol.asyncIterator]();
    while (true) {
      const results = await Promise.all([firstIterator.next(), secondIterator.next()]);
      const firstNext = results[0];
      const secondNext = results[1];
      if (firstNext.done || secondNext.done) {
        break;
      } else {
        yield resultSelector(firstNext.value, secondNext.value);
      }
    }
  }
  return new BasicAsyncEnumerable(generator);
};
const bindLinqAsync = (object) => {
  const prototype = object.prototype;
  const bind = (func, key) => {
    const wrapped = function(...params) {
      return func(this, ...params);
    };
    Object.defineProperty(wrapped, "length", { value: func.length - 1 });
    prototype[key] = wrapped;
  };
  bind(aggregate$1, "Aggregate");
  bind(all$1, "All");
  bind(allAsync$1, "AllAsync");
  bind(any$1, "Any");
  bind(anyAsync$1, "AnyAsync");
  bind(asParallel, "AsParallel");
  bind(average$1, "Average");
  bind(averageAsync$1, "AverageAsync");
  bind(concatenate$1, "Concatenate");
  bind(contains$1, "Contains");
  bind(containsAsync$1, "ContainsAsync");
  bind(count$1, "Count");
  bind(countAsync$1, "CountAsync");
  bind(distinct$1, "Distinct");
  bind(distinctAsync$1, "DistinctAsync");
  bind(each$1, "Each");
  bind(eachAsync$1, "EachAsync");
  bind(elementAt$1, "ElementAt");
  bind(elementAtOrDefault$1, "ElementAtOrDefault");
  bind(except$1, "Except");
  bind(exceptAsync$1, "ExceptAsync");
  bind(first$1, "First");
  bind(firstAsync$1, "FirstAsync");
  bind(firstOrDefault$1, "FirstOrDefault");
  bind(firstOrDefaultAsync$1, "FirstOrDefaultAsync");
  bind(groupBy$1, "GroupBy");
  bind(groupByAsync$1, "GroupByAsync");
  bind(groupByWithSel$1, "GroupByWithSel");
  bind(intersect$1, "Intersect");
  bind(intersectAsync$1, "IntersectAsync");
  bind(join$1, "JoinByKey");
  bind(last$1, "Last");
  bind(lastAsync$1, "LastAsync");
  bind(lastOrDefault$1, "LastOrDefault");
  bind(lastOrDefaultAsync$1, "LastOrDefaultAsync");
  bind(max$1, "Max");
  bind(maxAsync$1, "MaxAsync");
  bind(min$1, "Min");
  bind(minAsync$1, "MinAsync");
  bind(ofType$1, "OfType");
  bind(orderBy$1, "OrderBy");
  bind(orderByAsync$1, "OrderByAsync");
  bind(orderByDescending$1, "OrderByDescending");
  bind(orderByDescendingAsync$1, "OrderByDescendingAsync");
  bind(partition$1, "Partition");
  bind(partitionAsync$1, "PartitionAsync");
  bind(reverse$1, "Reverse");
  bind(select$1, "Select");
  bind(selectAsync$1, "SelectAsync");
  bind(selectMany$1, "SelectMany");
  bind(selectManyAsync$1, "SelectManyAsync");
  bind(sequenceEquals$1, "SequenceEquals");
  bind(sequenceEqualsAsync$1, "SequenceEqualsAsync");
  bind(single$1, "Single");
  bind(singleAsync$1, "SingleAsync");
  bind(singleOrDefault$1, "SingleOrDefault");
  bind(singleOrDefaultAsync$1, "SingleOrDefaultAsync");
  bind(skip$1, "Skip");
  bind(skipWhile$1, "SkipWhile");
  bind(skipWhileAsync$1, "SkipWhileAsync");
  bind(sum$1, "Sum");
  bind(sumAsync$1, "SumAsync");
  bind(take$1, "Take");
  bind(takeWhile$1, "TakeWhile");
  bind(takeWhileAsync$1, "TakeWhileAsync");
  bind(toArray$1, "ToArray");
  bind(toMap$1, "ToMap");
  bind(toMapAsync$1, "ToMapAsync");
  bind(toObject$1, "ToObject");
  bind(toObjectAsync$1, "ToObjectAsync");
  bind(toSet$1, "ToSet");
  bind(union$1, "Union");
  bind(unionAsync$1, "UnionAsync");
  bind(where$1, "Where");
  bind(whereAsync$1, "WhereAsync");
  bind(zip$1, "Zip");
  bind(zipAsync$1, "ZipAsync");
};
const aggregate = (source, seedOrFunc, func, resultSelector) => {
  if (resultSelector) {
    if (!func) {
      throw new ReferenceError(`TAccumulate function is undefined`);
    }
    return aggregate3(source, seedOrFunc, func, resultSelector);
  } else if (func) {
    return aggregate2(source, seedOrFunc, func);
  } else {
    return aggregate1(source, seedOrFunc);
  }
};
const aggregate1 = async (source, func) => {
  let aggregateValue;
  for await (const value of source) {
    if (aggregateValue) {
      aggregateValue = func(aggregateValue, value);
    } else {
      aggregateValue = value;
    }
  }
  if (aggregateValue === void 0) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return aggregateValue;
};
const aggregate2 = async (source, seed, func) => {
  let aggregateValue = seed;
  for await (const value of source) {
    aggregateValue = func(aggregateValue, value);
  }
  return aggregateValue;
};
const aggregate3 = async (source, seed, func, resultSelector) => {
  let aggregateValue = seed;
  for await (const value of source) {
    aggregateValue = func(aggregateValue, value);
  }
  return resultSelector(aggregateValue);
};
const nextIteration = (source, onfulfilled) => {
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray: {
      const generator = () => dataFunc.generator().then((x) => {
        const convValues = new Array(x.length);
        for (let i2 = 0; i2 < x.length; i2++) {
          convValues[i2] = onfulfilled(x[i2]);
        }
        return convValues;
      });
      return {
        generator,
        type: ParallelGeneratorType.PromiseToArray
      };
    }
    case ParallelGeneratorType.ArrayOfPromises: {
      const generator = () => {
        const previousData = dataFunc.generator();
        const newPromises = new Array(previousData.length);
        for (let i2 = 0; i2 < previousData.length; i2++) {
          newPromises[i2] = previousData[i2].then(onfulfilled);
        }
        return newPromises;
      };
      return {
        generator,
        type: ParallelGeneratorType.ArrayOfPromises
      };
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const generator = async () => {
        const previousData = await dataFunc.generator();
        const newPromises = new Array(previousData.length);
        for (let i2 = 0; i2 < previousData.length; i2++) {
          newPromises[i2] = previousData[i2].then(onfulfilled);
        }
        return newPromises;
      };
      return {
        generator,
        type: ParallelGeneratorType.PromiseOfPromises
      };
    }
  }
};
const all = (source, predicate) => {
  const nextIter = nextIteration(source, (x) => {
    if (!predicate(x)) {
      throw new Error(String(false));
    }
    return true;
  });
  switch (nextIter.type) {
    case ParallelGeneratorType.PromiseToArray:
      return nextIter.generator().then(() => true, () => false);
    case ParallelGeneratorType.ArrayOfPromises:
      return Promise.all(nextIter.generator()).then(() => true, () => false);
    case ParallelGeneratorType.PromiseOfPromises:
      return nextIter.generator().then(Promise.all.bind(Promise)).then(() => true, () => false);
  }
};
const nextIterationAsync = (source, onfulfilled) => {
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray: {
      const generator = async () => {
        const results = await dataFunc.generator();
        const newPromises = new Array(results.length);
        for (let i2 = 0; i2 < results.length; i2++) {
          newPromises[i2] = onfulfilled(results[i2]);
        }
        return newPromises;
      };
      return {
        generator,
        type: ParallelGeneratorType.PromiseOfPromises
      };
    }
    case ParallelGeneratorType.ArrayOfPromises: {
      const generator = () => {
        const promises = dataFunc.generator();
        return promises.map(async (promise) => {
          const value = await promise;
          return await onfulfilled(value);
        });
      };
      return {
        generator,
        type: ParallelGeneratorType.ArrayOfPromises
      };
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const generator = async () => {
        const promises = await dataFunc.generator();
        return promises.map((promise) => promise.then(onfulfilled));
      };
      return {
        generator,
        type: ParallelGeneratorType.PromiseOfPromises
      };
    }
  }
};
const allAsync = (source, predicate) => {
  const nextIter = nextIterationAsync(source, async (x) => {
    if (await predicate(x) === false) {
      throw new Error(String(false));
    }
    return true;
  });
  switch (nextIter.type) {
    case ParallelGeneratorType.ArrayOfPromises:
      return Promise.all(nextIter.generator()).then(() => true, () => false);
    case ParallelGeneratorType.PromiseOfPromises:
      return nextIter.generator().then(Promise.all.bind(Promise)).then(() => true, () => false);
  }
};
const any = (source, predicate) => {
  if (predicate) {
    return any2(source, predicate);
  } else {
    return any1(source);
  }
};
const any1 = async (source) => {
  const dataFunc = source.dataFunc;
  let values;
  switch (dataFunc.type) {
    case ParallelGeneratorType.ArrayOfPromises:
      values = dataFunc.generator();
      return values.length !== 0;
    case ParallelGeneratorType.PromiseToArray:
    case ParallelGeneratorType.PromiseOfPromises:
      values = await dataFunc.generator();
      return values.length !== 0;
  }
};
const any2 = async (source, predicate) => {
  const dataFunc = nextIteration(source, predicate);
  let values;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray:
      values = await dataFunc.generator();
      return values.includes(true);
    case ParallelGeneratorType.ArrayOfPromises:
      values = await Promise.all(dataFunc.generator());
      return values.includes(true);
    case ParallelGeneratorType.PromiseOfPromises:
      values = await Promise.all(await dataFunc.generator());
      return values.includes(true);
  }
};
const anyAsync = async (source, predicate) => {
  const nextIter = nextIterationAsync(source, predicate);
  let promises;
  switch (nextIter.type) {
    case ParallelGeneratorType.ArrayOfPromises:
      promises = nextIter.generator();
      if (promises.length === 0) {
        return false;
      }
      return new Promise((resolve, reject) => {
        let resolvedCount = 0;
        for (const promise of promises) {
          promise.then((value) => {
            resolvedCount++;
            if (value) {
              resolve(true);
            } else if (resolvedCount === promises.length) {
              resolve(false);
            }
          }, reject);
        }
      });
    case ParallelGeneratorType.PromiseOfPromises:
      promises = await nextIter.generator();
      if (Promise.length === 0) {
        return false;
      }
      const values = await Promise.all(promises);
      return values.includes(true);
  }
};
const asAsync = (source) => {
  async function* generator() {
    for await (const value of source) {
      yield value;
    }
  }
  return fromAsync(generator);
};
const typeDataToArray = async (dataFunc) => {
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray:
      return await dataFunc.generator();
    case ParallelGeneratorType.ArrayOfPromises:
      return await Promise.all(dataFunc.generator());
    case ParallelGeneratorType.PromiseOfPromises:
      const data = await dataFunc.generator();
      return await Promise.all(data);
  }
};
const average = async (source, selector) => {
  let data;
  if (selector) {
    data = nextIteration(source, selector);
  } else {
    data = source.dataFunc;
  }
  const values = await typeDataToArray(data);
  if (values.length === 0) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  let sum3 = 0;
  for (const item of values) {
    sum3 += item;
  }
  return sum3 / values.length;
};
const averageAsync = async (source, selector) => {
  const nextIter = nextIterationAsync(source, selector);
  const values = await typeDataToArray(nextIter);
  if (values.length === 0) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  let value = 0;
  for (const selectedValue of values) {
    value += selectedValue;
  }
  return value / values.length;
};
const concatenate = (first3, second) => {
  const generator = async () => {
    const [firstData, secondData] = await Promise.all([first3.ToArray(), second.ToArray()]);
    return [...firstData, ...secondData];
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const contains = async (source, value, comparer = StrictEqualityComparer) => {
  let values;
  if (comparer) {
    values = nextIteration(source, (x) => comparer(value, x));
  } else {
    values = nextIteration(source, (x) => x === value);
  }
  switch (values.type) {
    case ParallelGeneratorType.PromiseToArray: {
      const data = await values.generator();
      return data.some((x) => x);
    }
    case ParallelGeneratorType.ArrayOfPromises: {
      const data = await Promise.all(values.generator());
      return data.some((x) => x);
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const data = await Promise.all(await values.generator());
      return data.some((x) => x);
    }
  }
};
const containsAsync = async (source, value, comparer) => {
  const values = nextIterationAsync(source, (x) => comparer(value, x));
  switch (values.type) {
    case ParallelGeneratorType.ArrayOfPromises: {
      const data = await Promise.all(values.generator());
      return data.some((x) => x);
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const data = await Promise.all(await values.generator());
      return data.some((x) => x);
    }
  }
};
const count = (source, predicate) => {
  if (predicate) {
    return count2(source, predicate);
  } else {
    return count1(source);
  }
};
const count1 = async (source) => {
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray:
    case ParallelGeneratorType.PromiseOfPromises:
      const arrayData = await source.ToArray();
      return arrayData.length;
    case ParallelGeneratorType.ArrayOfPromises:
      const promises = dataFunc.generator();
      return promises.length;
  }
};
const count2 = async (source, predicate) => {
  const values = await source.ToArray();
  let totalCount = 0;
  for (let i2 = 0; i2 < values.length; i2++) {
    if (predicate(values[i2]) === true) {
      totalCount++;
    }
  }
  return totalCount;
};
const countAsync = async (source, predicate) => {
  const data = nextIterationAsync(source, predicate);
  let countPromise;
  switch (data.type) {
    case ParallelGeneratorType.ArrayOfPromises:
      countPromise = Promise.all(data.generator());
      break;
    case ParallelGeneratorType.PromiseOfPromises:
      countPromise = Promise.all(await data.generator());
      break;
  }
  let totalCount = 0;
  for (const value of await countPromise) {
    if (value) {
      totalCount++;
    }
  }
  return totalCount;
};
const distinct = (source, comparer = StrictEqualityComparer) => {
  const generator = async () => {
    const distinctElements = [];
    for (const item of await source.ToArray()) {
      const foundItem = distinctElements.find((x) => comparer(x, item));
      if (!foundItem) {
        distinctElements.push(item);
      }
    }
    return distinctElements;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const distinctAsync = (source, comparer) => {
  const generator = async () => {
    const distinctElements = [];
    outerLoop:
      for (const item of await source.ToArray()) {
        for (const distinctElement of distinctElements) {
          const found = await comparer(distinctElement, item);
          if (found) {
            continue outerLoop;
          }
        }
        distinctElements.push(item);
      }
    return distinctElements;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const each = (source, action) => {
  return new BasicParallelEnumerable(nextIteration(source, (x) => {
    action(x);
    return x;
  }));
};
const eachAsync = (source, action) => {
  const dataFunc = nextIterationAsync(source, async (x) => {
    await action(x);
    return x;
  });
  return new BasicParallelEnumerable(dataFunc);
};
const elementAt = async (source, index) => {
  if (index < 0) {
    throw new ArgumentOutOfRangeException("index");
  }
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray: {
      const values = await dataFunc.generator();
      if (index >= values.length) {
        throw new ArgumentOutOfRangeException("index");
      } else {
        return values[index];
      }
    }
    case ParallelGeneratorType.ArrayOfPromises: {
      const promises = dataFunc.generator();
      if (index >= promises.length) {
        throw new ArgumentOutOfRangeException("index");
      } else {
        return await promises[index];
      }
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const promises = await dataFunc.generator();
      if (index >= promises.length) {
        throw new ArgumentOutOfRangeException("index");
      } else {
        return await promises[index];
      }
    }
  }
};
const elementAtOrDefault = async (source, index) => {
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray: {
      const values = await dataFunc.generator();
      if (index >= values.length) {
        return null;
      } else {
        return values[index];
      }
    }
    case ParallelGeneratorType.ArrayOfPromises: {
      const promises = dataFunc.generator();
      if (index >= promises.length) {
        return null;
      } else {
        return await promises[index];
      }
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const promises = await dataFunc.generator();
      if (index >= promises.length) {
        return null;
      } else {
        return await promises[index];
      }
    }
  }
};
const except = (first3, second, comparer = StrictEqualityComparer) => {
  const generator = async () => {
    const [firstValues, secondValues] = await Promise.all([first3.ToArray(), second.ToArray()]);
    const resultValues = [];
    for (const firstItem of firstValues) {
      let exists = false;
      for (let j = 0; j < secondValues.length; j++) {
        const secondItem = secondValues[j];
        if (comparer(firstItem, secondItem) === true) {
          exists = true;
          break;
        }
      }
      if (exists === false) {
        resultValues.push(firstItem);
      }
    }
    return resultValues;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const exceptAsync = (first3, second, comparer) => {
  const generator = async () => {
    const [firstValues, secondValues] = await Promise.all([first3.ToArray(), second.ToArray()]);
    const resultValues = [];
    for (const firstItem of firstValues) {
      let exists = false;
      for (let j = 0; j < secondValues.length; j++) {
        const secondItem = secondValues[j];
        if (await comparer(firstItem, secondItem) === true) {
          exists = true;
          break;
        }
      }
      if (exists === false) {
        resultValues.push(firstItem);
      }
    }
    return resultValues;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const toArray = (source) => {
  return typeDataToArray(source.dataFunc);
};
const first = (source, predicate) => {
  if (predicate) {
    return first2(source, predicate);
  } else {
    return first1(source);
  }
};
const first1 = async (source) => {
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray: {
      const values = await dataFunc.generator();
      if (values.length === 0) {
        throw new InvalidOperationException(ErrorString.NoElements);
      } else {
        return values[0];
      }
    }
    case ParallelGeneratorType.ArrayOfPromises: {
      const promises = dataFunc.generator();
      if (promises.length === 0) {
        throw new InvalidOperationException(ErrorString.NoElements);
      } else {
        return await promises[0];
      }
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const promises = await dataFunc.generator();
      if (promises.length === 0) {
        throw new InvalidOperationException(ErrorString.NoElements);
      } else {
        return await promises[0];
      }
    }
  }
};
const first2 = async (source, predicate) => {
  const data = await toArray(source);
  for (const value of data) {
    if (predicate(value) === true) {
      return value;
    }
  }
  throw new InvalidOperationException(ErrorString.NoMatch);
};
const firstAsync = async (source, predicate) => {
  const data = await toArray(source);
  for (const value of data) {
    if (await predicate(value) === true) {
      return value;
    }
  }
  throw new InvalidOperationException(ErrorString.NoMatch);
};
const firstOrDefault = (source, predicate) => {
  if (predicate) {
    return firstOrDefault2(source, predicate);
  } else {
    return firstOrDefault1(source);
  }
};
const firstOrDefault1 = async (source) => {
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray: {
      const values = await dataFunc.generator();
      if (values.length === 0) {
        return null;
      } else {
        return values[0];
      }
    }
    case ParallelGeneratorType.ArrayOfPromises: {
      const promises = dataFunc.generator();
      if (promises.length === 0) {
        return null;
      } else {
        return await promises[0];
      }
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const promises = await dataFunc.generator();
      if (promises.length === 0) {
        return null;
      } else {
        return await promises[0];
      }
    }
  }
};
const firstOrDefault2 = async (source, predicate) => {
  const data = await toArray(source);
  for (const value of data) {
    if (predicate(value) === true) {
      return value;
    }
  }
  return null;
};
const firstOrDefaultAsync = async (source, predicate) => {
  const data = await toArray(source);
  for (const value of data) {
    if (await predicate(value) === true) {
      return value;
    }
  }
  return null;
};
const groupBy = (source, keySelector, comparer) => {
  if (comparer) {
    return groupBy_0(source, keySelector, comparer);
  } else {
    return groupBy_0_Simple(source, keySelector);
  }
};
const groupBy_0_Simple = (source, keySelector) => {
  const generator = async () => {
    const keyMap = {};
    for (const value of await source.ToArray()) {
      const key = keySelector(value);
      const grouping = keyMap[key];
      if (grouping) {
        grouping.push(value);
      } else {
        keyMap[key] = new Grouping(key, value);
      }
    }
    const results = new Array();
    for (const value in keyMap) {
      results.push(keyMap[value]);
    }
    return results;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const groupBy_0 = (source, keySelector, comparer) => {
  const generator = async () => {
    const keyMap = new Array();
    for (const value of await source.ToArray()) {
      const key = keySelector(value);
      let found = false;
      for (let i2 = 0; i2 < keyMap.length; i2++) {
        const group = keyMap[i2];
        if (comparer(group.key, key)) {
          group.push(value);
          found = true;
          break;
        }
      }
      if (found === false) {
        keyMap.push(new Grouping(key, value));
      }
    }
    const results = new Array();
    for (const g2 of keyMap) {
      results.push(g2);
    }
    return results;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const groupByAsync = (source, keySelector, comparer) => {
  if (comparer) {
    return groupByAsync_0(source, keySelector, comparer);
  } else {
    return groupByAsync_0_Simple(source, keySelector);
  }
};
const groupByAsync_0 = (source, keySelector, comparer) => {
  const generator = async () => {
    const typedData = nextIterationAsync(source, async (value) => {
      const key = await keySelector(value);
      return [key, value];
    });
    let values;
    switch (typedData.type) {
      case ParallelGeneratorType.ArrayOfPromises:
        values = await Promise.all(typedData.generator());
        break;
      case ParallelGeneratorType.PromiseOfPromises:
        values = await Promise.all(await typedData.generator());
        break;
    }
    const keyMap = new Array();
    for (const [key, value] of values) {
      let found = false;
      for (let i2 = 0; i2 < keyMap.length; i2++) {
        const group = keyMap[i2];
        if (await comparer(group.key, key) === true) {
          group.push(value);
          found = true;
          break;
        }
      }
      if (found === false) {
        keyMap.push(new Grouping(key, value));
      }
    }
    const results = new Array();
    for (const g2 of keyMap) {
      results.push(g2);
    }
    return results;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const groupByAsync_0_Simple = (source, keySelector) => {
  const generator = async () => {
    const typedData = nextIterationAsync(source, async (value) => {
      const key = await keySelector(value);
      return [key, value];
    });
    let values;
    switch (typedData.type) {
      case ParallelGeneratorType.ArrayOfPromises:
        values = await Promise.all(typedData.generator());
        break;
      case ParallelGeneratorType.PromiseOfPromises:
        values = await Promise.all(await typedData.generator());
        break;
    }
    const keyMap = {};
    for (const [key, value] of values) {
      const grouping = keyMap[key];
      if (grouping) {
        grouping.push(value);
      } else {
        keyMap[key] = new Grouping(key, value);
      }
    }
    const results = new Array();
    for (const value in keyMap) {
      results.push(keyMap[value]);
    }
    return results;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const groupByWithSel = (source, keySelector, elementSelector, comparer) => {
  if (comparer) {
    return groupBy1(source, keySelector, elementSelector, comparer);
  } else {
    return groupBy1Simple(source, keySelector, elementSelector);
  }
};
const groupBy1 = (source, keySelector, elementSelector, comparer) => {
  const generator = async () => {
    const keyMap = new Array();
    for await (const value of source) {
      const key = keySelector(value);
      let found = false;
      for (let i2 = 0; i2 < keyMap.length; i2++) {
        const group = keyMap[i2];
        if (comparer(group.key, key)) {
          group.push(elementSelector(value));
          found = true;
          break;
        }
      }
      if (found === false) {
        const element = elementSelector(value);
        keyMap.push(new Grouping(key, element));
      }
    }
    const results = new Array();
    for (const value of keyMap) {
      results.push(value);
    }
    return results;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const groupBy1Simple = (source, keySelector, elementSelector) => {
  const generator = async () => {
    const keyMap = {};
    for (const value of await source.ToArray()) {
      const key = keySelector(value);
      const grouping = keyMap[key];
      const element = elementSelector(value);
      if (grouping) {
        grouping.push(element);
      } else {
        keyMap[key] = new Grouping(key, element);
      }
    }
    const results = new Array();
    for (const value in keyMap) {
      results.push(keyMap[value]);
    }
    return results;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const intersect = (first3, second, comparer = StrictEqualityComparer) => {
  const generator = async () => {
    const firstResults = await first3.Distinct(comparer).ToArray();
    if (firstResults.length === 0) {
      return [];
    }
    const secondResults = await second.ToArray();
    const results = new Array();
    for (let i2 = 0; i2 < firstResults.length; i2++) {
      const firstValue = firstResults[i2];
      for (let j = 0; j < secondResults.length; j++) {
        const secondValue = secondResults[j];
        if (comparer(firstValue, secondValue) === true) {
          results.push(firstValue);
          break;
        }
      }
    }
    return results;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const intersectAsync = (first3, second, comparer) => {
  const generator = async () => {
    const firstResults = await first3.DistinctAsync(comparer).ToArray();
    if (firstResults.length === 0) {
      return [];
    }
    const secondResults = await second.ToArray();
    const results = new Array();
    for (let i2 = 0; i2 < firstResults.length; i2++) {
      const firstValue = firstResults[i2];
      for (let j = 0; j < secondResults.length; j++) {
        const secondValue = secondResults[j];
        if (await comparer(firstValue, secondValue) === true) {
          results.push(firstValue);
          break;
        }
      }
    }
    return results;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const join = (outer, inner, outerKeySelector, innerKeySelector, resultSelector, comparer = StrictEqualityComparer) => {
  const generator = async () => {
    const [innerArray, outerArray] = await Promise.all([inner.ToArray(), outer.ToArray()]);
    const results = new Array();
    for (const o2 of outerArray) {
      const outerKey = outerKeySelector(o2);
      for (const i2 of innerArray) {
        const innerKey = innerKeySelector(i2);
        if (comparer(outerKey, innerKey) === true) {
          results.push(resultSelector(o2, i2));
        }
      }
    }
    return results;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const last = (source, predicate) => {
  if (predicate) {
    return last2(source, predicate);
  } else {
    return last1(source);
  }
};
const last1 = async (source) => {
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray: {
      const values = await dataFunc.generator();
      if (values.length === 0) {
        throw new InvalidOperationException(ErrorString.NoElements);
      } else {
        return values[values.length - 1];
      }
    }
    case ParallelGeneratorType.ArrayOfPromises: {
      const promises = dataFunc.generator();
      if (promises.length === 0) {
        throw new InvalidOperationException(ErrorString.NoElements);
      } else {
        return await promises[promises.length - 1];
      }
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const promises = await dataFunc.generator();
      if (promises.length === 0) {
        throw new InvalidOperationException(ErrorString.NoElements);
      } else {
        return await promises[promises.length - 1];
      }
    }
  }
};
const last2 = async (source, predicate) => {
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray: {
      const values = await dataFunc.generator();
      for (let i2 = values.length - 1; i2 >= 0; i2--) {
        const value = values[i2];
        if (predicate(value)) {
          return value;
        }
      }
      break;
    }
    case ParallelGeneratorType.ArrayOfPromises: {
      const promises = dataFunc.generator();
      for (let i2 = promises.length - 1; i2 >= 0; i2--) {
        const value = await promises[i2];
        if (predicate(value)) {
          return value;
        }
      }
      break;
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const promises = await dataFunc.generator();
      for (let i2 = promises.length - 1; i2 >= 0; i2--) {
        const value = await promises[i2];
        if (predicate(value)) {
          return value;
        }
      }
      break;
    }
  }
  throw new InvalidOperationException(ErrorString.NoMatch);
};
const lastAsync = async (source, predicate) => {
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray: {
      const values = await dataFunc.generator();
      for (let i2 = values.length - 1; i2 >= 0; i2--) {
        const value = values[i2];
        if (await predicate(value) === true) {
          return value;
        }
      }
      break;
    }
    case ParallelGeneratorType.ArrayOfPromises: {
      const promises = dataFunc.generator();
      for (let i2 = promises.length - 1; i2 >= 0; i2--) {
        const value = await promises[i2];
        if (await predicate(value) === true) {
          return value;
        }
      }
      break;
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const promises = await dataFunc.generator();
      for (let i2 = promises.length - 1; i2 >= 0; i2--) {
        const value = await promises[i2];
        if (await predicate(value) === true) {
          return value;
        }
      }
      break;
    }
  }
  throw new InvalidOperationException(ErrorString.NoMatch);
};
const lastOrDefault = (source, predicate) => {
  if (predicate) {
    return lastOrDefault2(source, predicate);
  } else {
    return lastOrDefault1(source);
  }
};
const lastOrDefault1 = async (source) => {
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray: {
      const values = await dataFunc.generator();
      if (values.length === 0) {
        return null;
      } else {
        return values[values.length - 1];
      }
    }
    case ParallelGeneratorType.ArrayOfPromises: {
      const promises = dataFunc.generator();
      if (promises.length === 0) {
        return null;
      } else {
        return await promises[promises.length - 1];
      }
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const promises = await dataFunc.generator();
      if (promises.length === 0) {
        return null;
      } else {
        return await promises[promises.length - 1];
      }
    }
  }
};
const lastOrDefault2 = async (source, predicate) => {
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray: {
      const values = await dataFunc.generator();
      for (let i2 = values.length - 1; i2 >= 0; i2--) {
        const value = values[i2];
        if (predicate(value)) {
          return value;
        }
      }
      break;
    }
    case ParallelGeneratorType.ArrayOfPromises: {
      const promises = dataFunc.generator();
      for (let i2 = promises.length - 1; i2 >= 0; i2--) {
        const value = await promises[i2];
        if (predicate(value)) {
          return value;
        }
      }
      break;
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const promises = await dataFunc.generator();
      for (let i2 = promises.length - 1; i2 >= 0; i2--) {
        const value = await promises[i2];
        if (predicate(value)) {
          return value;
        }
      }
      break;
    }
  }
  return null;
};
const lastOrDefaultAsync = async (source, predicate) => {
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray: {
      const values = await dataFunc.generator();
      for (let i2 = values.length - 1; i2 >= 0; i2--) {
        const value = values[i2];
        if (await predicate(value) === true) {
          return value;
        }
      }
      break;
    }
    case ParallelGeneratorType.ArrayOfPromises: {
      const promises = dataFunc.generator();
      for (let i2 = promises.length - 1; i2 >= 0; i2--) {
        const value = await promises[i2];
        if (await predicate(value) === true) {
          return value;
        }
      }
      break;
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const promises = await dataFunc.generator();
      for (let i2 = promises.length - 1; i2 >= 0; i2--) {
        const value = await promises[i2];
        if (await predicate(value) === true) {
          return value;
        }
      }
      break;
    }
  }
  return null;
};
const max = async (source, selector) => {
  let dataFunc;
  if (selector) {
    dataFunc = nextIteration(source, selector);
  } else {
    dataFunc = source.dataFunc;
  }
  const data = await typeDataToArray(dataFunc);
  if (data.length === 0) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return Math.max.apply(null, data);
};
const maxAsync = async (source, selector) => {
  const dataFunc = nextIterationAsync(source, selector);
  const maxInfo = await typeDataToArray(dataFunc);
  if (maxInfo.length === 0) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return Math.max.apply(null, maxInfo);
};
const min = async (source, selector) => {
  let dataFunc;
  if (selector) {
    dataFunc = nextIteration(source, selector);
  } else {
    dataFunc = source.dataFunc;
  }
  const data = await typeDataToArray(dataFunc);
  if (data.length === 0) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return Math.min.apply(null, data);
};
const minAsync = async (source, selector) => {
  const dataFunc = nextIterationAsync(source, selector);
  const maxInfo = await typeDataToArray(dataFunc);
  if (maxInfo.length === 0) {
    throw new InvalidOperationException(ErrorString.NoElements);
  }
  return Math.min.apply(null, maxInfo);
};
const ofType = (source, type) => {
  const typeCheck = typeof type === "string" ? (x) => [typeof x === type, x] : (x) => [x instanceof type, x];
  const generator = async () => {
    const dataFunc = nextIteration(source, typeCheck);
    const values = await typeDataToArray(dataFunc);
    const filteredValues = [];
    for (const [pass, value] of values) {
      if (pass) {
        filteredValues.push(value);
      }
    }
    return filteredValues;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const asAsyncKeyMap = async (source, keySelector) => {
  const map = /* @__PURE__ */ new Map();
  for await (const item of source) {
    const key = await keySelector(item);
    const currentMapping = map.get(key);
    if (currentMapping) {
      currentMapping.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
};
async function* asAsyncSortedKeyValues(source, keySelector, ascending, comparer) {
  const map = await asAsyncKeyMap(source, keySelector);
  const sortedKeys = [...map.keys()].sort(comparer ? comparer : void 0);
  if (ascending) {
    for (let i2 = 0; i2 < sortedKeys.length; i2++) {
      yield map.get(sortedKeys[i2]);
    }
  } else {
    for (let i2 = sortedKeys.length - 1; i2 >= 0; i2--) {
      yield map.get(sortedKeys[i2]);
    }
  }
}
const asAsyncKeyMapSync = async (source, keySelector) => {
  const map = /* @__PURE__ */ new Map();
  for (const item of source) {
    const key = await keySelector(item);
    const currentMapping = map.get(key);
    if (currentMapping) {
      currentMapping.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
};
async function* asAsyncSortedKeyValuesSync(source, keySelector, ascending, comparer) {
  const map = await asAsyncKeyMapSync(source, keySelector);
  const sortedKeys = [...map.keys()].sort(comparer ? comparer : void 0);
  if (ascending) {
    for (let i2 = 0; i2 < sortedKeys.length; i2++) {
      yield map.get(sortedKeys[i2]);
    }
  } else {
    for (let i2 = sortedKeys.length - 1; i2 >= 0; i2--) {
      yield map.get(sortedKeys[i2]);
    }
  }
}
const asKeyMap = async (source, keySelector) => {
  const map = /* @__PURE__ */ new Map();
  for await (const item of source) {
    const key = keySelector(item);
    const currentMapping = map.get(key);
    if (currentMapping) {
      currentMapping.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
};
async function* asSortedKeyValues(source, keySelector, ascending, comparer) {
  const map = await asKeyMap(source, keySelector);
  const sortedKeys = [...map.keys()].sort(comparer ? comparer : void 0);
  if (ascending) {
    for (let i2 = 0; i2 < sortedKeys.length; i2++) {
      yield map.get(sortedKeys[i2]);
    }
  } else {
    for (let i2 = sortedKeys.length - 1; i2 >= 0; i2--) {
      yield map.get(sortedKeys[i2]);
    }
  }
}
const asKeyMapSync = (source, keySelector) => {
  const map = /* @__PURE__ */ new Map();
  for (const item of source) {
    const key = keySelector(item);
    const currentMapping = map.get(key);
    if (currentMapping) {
      currentMapping.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
};
async function* asSortedKeyValuesSync(source, keySelector, ascending, comparer) {
  const map = asKeyMapSync(source, keySelector);
  const sortedKeys = [...map.keys()].sort(comparer ? comparer : void 0);
  if (ascending) {
    for (let i2 = 0; i2 < sortedKeys.length; i2++) {
      yield map.get(sortedKeys[i2]);
    }
  } else {
    for (let i2 = sortedKeys.length - 1; i2 >= 0; i2--) {
      yield map.get(sortedKeys[i2]);
    }
  }
}
class OrderedParallelEnumerable extends BasicParallelEnumerable {
  constructor(orderedPairs) {
    super({
      generator: async () => {
        const asyncVals = orderedPairs();
        const array = [];
        for await (const val of asyncVals) {
          array.push(...val);
        }
        return array;
      },
      type: ParallelGeneratorType.PromiseToArray
    });
    this.orderedPairs = orderedPairs;
  }
  static generateAsync(source, keySelector, ascending, comparer) {
    let orderedPairs;
    if (source instanceof OrderedParallelEnumerable) {
      orderedPairs = async function* () {
        for await (const pair of source.orderedPairs()) {
          yield* asAsyncSortedKeyValuesSync(pair, keySelector, ascending, comparer);
        }
      };
    } else {
      orderedPairs = () => asAsyncSortedKeyValues(source, keySelector, ascending, comparer);
    }
    return new OrderedParallelEnumerable(orderedPairs);
  }
  static generate(source, keySelector, ascending, comparer) {
    let orderedPairs;
    if (source instanceof OrderedParallelEnumerable) {
      orderedPairs = async function* () {
        for await (const pair of source.orderedPairs()) {
          yield* asSortedKeyValuesSync(pair, keySelector, ascending, comparer);
        }
      };
    } else {
      orderedPairs = () => asSortedKeyValues(source, keySelector, ascending, comparer);
    }
    return new OrderedParallelEnumerable(orderedPairs);
  }
  ThenBy(keySelector, comparer) {
    return OrderedParallelEnumerable.generate(this, keySelector, true, comparer);
  }
  ThenByAsync(keySelector, comparer) {
    return OrderedParallelEnumerable.generateAsync(this, keySelector, true, comparer);
  }
  ThenByDescending(keySelector, comparer) {
    return OrderedParallelEnumerable.generate(this, keySelector, false, comparer);
  }
  ThenByDescendingAsync(keySelector, comparer) {
    return OrderedParallelEnumerable.generateAsync(this, keySelector, false, comparer);
  }
}
const orderBy = (source, keySelector, comparer) => {
  return OrderedParallelEnumerable.generate(source, keySelector, true, comparer);
};
const orderByAsync = (source, keySelector, comparer) => {
  return OrderedParallelEnumerable.generateAsync(source, keySelector, true, comparer);
};
const orderByDescending = (source, keySelector, comparer) => {
  return OrderedParallelEnumerable.generate(source, keySelector, false, comparer);
};
const orderByDescendingAsync = (source, keySelector, comparer) => {
  return OrderedParallelEnumerable.generateAsync(source, keySelector, false, comparer);
};
const partition = async (source, predicate) => {
  const dataFunc = nextIteration(source, (value) => {
    return [predicate(value), value];
  });
  const values = await typeDataToArray(dataFunc);
  const fail = [];
  const pass = [];
  for (const [passed, value] of values) {
    if (passed) {
      pass.push(value);
    } else {
      fail.push(value);
    }
  }
  return [pass, fail];
};
const partitionAsync = async (source, predicate) => {
  const dataFunc = nextIterationAsync(source, async (value) => {
    const passed = await predicate(value);
    return [passed, value];
  });
  const values = await typeDataToArray(dataFunc);
  const fail = [];
  const pass = [];
  for (const [passed, value] of values) {
    if (passed) {
      pass.push(value);
    } else {
      fail.push(value);
    }
  }
  return [pass, fail];
};
const reverse = (source) => {
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.ArrayOfPromises: {
      const generator = () => {
        return dataFunc.generator().reverse();
      };
      return new BasicParallelEnumerable({
        generator,
        type: dataFunc.type
      });
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const generator = async () => {
        const array = await dataFunc.generator();
        return array.reverse();
      };
      return new BasicParallelEnumerable({
        generator,
        type: dataFunc.type
      });
    }
    case ParallelGeneratorType.PromiseToArray: {
      const generator = async () => {
        const array = await dataFunc.generator();
        return array.reverse();
      };
      return new BasicParallelEnumerable({
        generator,
        type: dataFunc.type
      });
    }
  }
};
const nextIterationWithIndex = (source, onfulfilled) => {
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray: {
      const generator = () => dataFunc.generator().then((x) => {
        const convValues = new Array(x.length);
        for (let i2 = 0; i2 < x.length; i2++) {
          convValues[i2] = onfulfilled(x[i2], i2);
        }
        return convValues;
      });
      return {
        generator,
        type: ParallelGeneratorType.PromiseToArray
      };
    }
    case ParallelGeneratorType.ArrayOfPromises: {
      const generator = () => {
        const previousData = dataFunc.generator();
        const newPromises = new Array(previousData.length);
        for (let i2 = 0; i2 < previousData.length; i2++) {
          newPromises[i2] = previousData[i2].then((value) => {
            return onfulfilled(value, i2);
          });
        }
        return newPromises;
      };
      return {
        generator,
        type: ParallelGeneratorType.ArrayOfPromises
      };
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const generator = async () => {
        const previousData = await dataFunc.generator();
        const newPromises = new Array(previousData.length);
        for (let i2 = 0; i2 < previousData.length; i2++) {
          newPromises[i2] = previousData[i2].then((value) => onfulfilled(value, i2));
        }
        return newPromises;
      };
      return {
        generator,
        type: ParallelGeneratorType.PromiseOfPromises
      };
    }
  }
};
const select = (source, key) => {
  if (typeof key === "function") {
    if (key.length === 1) {
      return new BasicParallelEnumerable(nextIteration(source, key));
    } else {
      return new BasicParallelEnumerable(nextIterationWithIndex(source, key));
    }
  } else {
    return new BasicParallelEnumerable(nextIteration(source, (x) => x[key]));
  }
};
const nextIterationWithIndexAsync = (source, onfulfilled) => {
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray: {
      const generator = async () => {
        const results = await dataFunc.generator();
        const newPromises = new Array(results.length);
        for (let i2 = 0; i2 < results.length; i2++) {
          newPromises[i2] = onfulfilled(results[i2], i2);
        }
        return newPromises;
      };
      return {
        generator,
        type: ParallelGeneratorType.PromiseOfPromises
      };
    }
    case ParallelGeneratorType.ArrayOfPromises: {
      const generator = () => dataFunc.generator().map((promise, index) => promise.then((x) => onfulfilled(x, index)));
      return {
        generator,
        type: ParallelGeneratorType.ArrayOfPromises
      };
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const generator = async () => {
        const promises = await dataFunc.generator();
        return promises.map((promise, index) => promise.then((x) => onfulfilled(x, index)));
      };
      return {
        generator,
        type: ParallelGeneratorType.PromiseOfPromises
      };
    }
  }
};
const selectAsync = (source, keyOrSelector) => {
  let generator;
  if (typeof keyOrSelector === "function") {
    if (keyOrSelector.length === 1) {
      generator = nextIterationAsync(source, keyOrSelector);
    } else {
      generator = nextIterationWithIndexAsync(source, keyOrSelector);
    }
  } else {
    generator = nextIterationAsync(source, (x) => x[keyOrSelector]);
  }
  return new BasicParallelEnumerable(generator);
};
const selectMany = (source, selector) => {
  const generator = async () => {
    let values;
    if (typeof selector === "function") {
      if (selector.length === 1) {
        values = nextIteration(source, selector);
      } else {
        values = nextIterationWithIndex(source, selector);
      }
    } else {
      values = nextIteration(source, (x) => x[selector]);
    }
    const valuesArray = [];
    switch (values.type) {
      case ParallelGeneratorType.PromiseToArray: {
        for (const outer of await values.generator()) {
          for (const y2 of outer) {
            valuesArray.push(y2);
          }
        }
        break;
      }
      case ParallelGeneratorType.ArrayOfPromises: {
        for (const outer of values.generator()) {
          for (const y2 of await outer) {
            valuesArray.push(y2);
          }
        }
        break;
      }
      case ParallelGeneratorType.PromiseOfPromises: {
        for (const outer of await values.generator()) {
          for (const y2 of await outer) {
            valuesArray.push(y2);
          }
        }
        break;
      }
    }
    return valuesArray;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const selectManyAsync = (source, selector) => {
  const generator = async () => {
    let values;
    if (selector.length === 1) {
      values = nextIterationAsync(source, selector);
    } else {
      values = nextIterationWithIndexAsync(source, selector);
    }
    const valuesArray = [];
    switch (values.type) {
      case ParallelGeneratorType.ArrayOfPromises: {
        for (const outer of values.generator()) {
          for (const y2 of await outer) {
            valuesArray.push(y2);
          }
        }
        break;
      }
      case ParallelGeneratorType.PromiseOfPromises: {
        for (const outer of await values.generator()) {
          for (const y2 of await outer) {
            valuesArray.push(y2);
          }
        }
        break;
      }
    }
    return valuesArray;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const sequenceEquals = async (first3, second, comparer = StrictEqualityComparer) => {
  const firstArray = await first3.ToArray();
  const secondArray = await second.ToArray();
  if (firstArray.length !== secondArray.length) {
    return false;
  }
  for (let i2 = 0; i2 < firstArray.length; i2++) {
    const firstResult = firstArray[i2];
    const secondResult = secondArray[i2];
    if (comparer(firstResult, secondResult) === false) {
      return false;
    }
  }
  return true;
};
const sequenceEqualsAsync = async (first3, second, comparer) => {
  const firstArray = await first3.ToArray();
  const secondArray = await second.ToArray();
  if (firstArray.length !== secondArray.length) {
    return false;
  }
  for (let i2 = 0; i2 < firstArray.length; i2++) {
    const firstResult = firstArray[i2];
    const secondResult = secondArray[i2];
    if (await comparer(firstResult, secondResult) === false) {
      return false;
    }
  }
  return true;
};
const single = (source, predicate) => {
  if (predicate) {
    return single2(source, predicate);
  } else {
    return single1(source);
  }
};
const single1 = async (source) => {
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray: {
      const results = await dataFunc.generator();
      if (results.length > 1) {
        throw new InvalidOperationException(ErrorString.MoreThanOneElement);
      } else if (results.length === 0) {
        throw new InvalidOperationException(ErrorString.NoElements);
      }
      return results[0];
    }
    case ParallelGeneratorType.ArrayOfPromises: {
      const results = dataFunc.generator();
      if (results.length > 1) {
        throw new InvalidOperationException(ErrorString.MoreThanOneElement);
      } else if (results.length === 0) {
        throw new InvalidOperationException(ErrorString.NoElements);
      }
      return results[0];
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const results = await dataFunc.generator();
      if (results.length > 1) {
        throw new InvalidOperationException(ErrorString.MoreThanOneElement);
      } else if (results.length === 0) {
        throw new InvalidOperationException(ErrorString.NoElements);
      }
      return await results[0];
    }
  }
};
const single2 = async (source, predicate) => {
  const results = await toArray(source);
  let hasValue = false;
  let singleValue = null;
  for (const value of results) {
    if (predicate(value)) {
      if (hasValue === true) {
        throw new InvalidOperationException(ErrorString.MoreThanOneMatchingElement);
      } else {
        hasValue = true;
        singleValue = value;
      }
    }
  }
  if (hasValue === false) {
    throw new InvalidOperationException(ErrorString.NoMatch);
  }
  return singleValue;
};
const singleAsync = async (source, predicate) => {
  const results = await toArray(source);
  let hasValue = false;
  let singleValue = null;
  for (const value of results) {
    if (await predicate(value) === true) {
      if (hasValue === true) {
        throw new InvalidOperationException(ErrorString.MoreThanOneMatchingElement);
      } else {
        hasValue = true;
        singleValue = value;
      }
    }
  }
  if (hasValue === false) {
    throw new InvalidOperationException(ErrorString.NoMatch);
  }
  return singleValue;
};
const singleOrDefault = (source, predicate) => {
  if (predicate) {
    return singleOrDefault2(source, predicate);
  } else {
    return singleOrDefault1(source);
  }
};
const singleOrDefault1 = async (source) => {
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray: {
      const results = await dataFunc.generator();
      if (results.length > 1) {
        throw new InvalidOperationException(ErrorString.MoreThanOneElement);
      } else if (results.length === 0) {
        return null;
      }
      return results[0];
    }
    case ParallelGeneratorType.ArrayOfPromises: {
      const results = dataFunc.generator();
      if (results.length > 1) {
        throw new InvalidOperationException(ErrorString.MoreThanOneElement);
      } else if (results.length === 0) {
        return null;
      }
      return results[0];
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const results = await dataFunc.generator();
      if (results.length > 1) {
        throw new InvalidOperationException(ErrorString.MoreThanOneElement);
      } else if (results.length === 0) {
        return null;
      }
      return await results[0];
    }
  }
};
const singleOrDefault2 = async (source, predicate) => {
  const results = await toArray(source);
  let hasValue = false;
  let singleValue = null;
  for (const value of results) {
    if (predicate(value)) {
      if (hasValue === true) {
        throw new InvalidOperationException(ErrorString.MoreThanOneElement);
      } else {
        hasValue = true;
        singleValue = value;
      }
    }
  }
  return singleValue;
};
const singleOrDefaultAsync = async (source, predicate) => {
  const results = await toArray(source);
  let hasValue = false;
  let singleValue = null;
  for (const value of results) {
    if (await predicate(value) === true) {
      if (hasValue === true) {
        throw new InvalidOperationException(ErrorString.MoreThanOneElement);
      } else {
        hasValue = true;
        singleValue = value;
      }
    }
  }
  return singleValue;
};
const skip = (source, count3) => {
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.PromiseToArray: {
      const generator = async () => (await dataFunc.generator()).slice(count3);
      return new BasicParallelEnumerable({
        generator,
        type: ParallelGeneratorType.PromiseToArray
      });
    }
    case ParallelGeneratorType.ArrayOfPromises: {
      const generator = () => dataFunc.generator().slice(count3);
      return new BasicParallelEnumerable({
        generator,
        type: ParallelGeneratorType.ArrayOfPromises
      });
    }
    case ParallelGeneratorType.PromiseOfPromises: {
      const generator = async () => {
        const dataInner = await dataFunc.generator();
        return dataInner.slice(count3);
      };
      const dataFuncNew = {
        generator,
        type: ParallelGeneratorType.PromiseOfPromises
      };
      return new BasicParallelEnumerable(dataFuncNew);
    }
  }
};
const skipWhile = (source, predicate) => {
  const generator = async () => {
    const values = await source.ToArray();
    let i2 = 0;
    for (; i2 < values.length; i2++) {
      const value = values[i2];
      if (predicate(value, i2) === false) {
        break;
      }
    }
    const returnedValues = [];
    for (; i2 < values.length; i2++) {
      returnedValues.push(values[i2]);
    }
    return returnedValues;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const skipWhileAsync = (source, predicate) => {
  const generator = async () => {
    const values = await source.ToArray();
    let i2 = 0;
    for (; i2 < values.length; i2++) {
      const value = values[i2];
      if (await predicate(value, i2) === false) {
        break;
      }
    }
    const returnedValues = [];
    for (; i2 < values.length; i2++) {
      returnedValues.push(values[i2]);
    }
    return returnedValues;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const sum = (source, selector) => {
  if (selector) {
    return sum2(source, selector);
  } else {
    return sum1(source);
  }
};
const sum1 = async (source) => {
  let totalSum = 0;
  for (const value of await source.ToArray()) {
    totalSum += value;
  }
  return totalSum;
};
const sum2 = async (source, selector) => {
  let total = 0;
  for (const value of await source.ToArray()) {
    total += selector(value);
  }
  return total;
};
const sumAsync = async (source, selector) => {
  const dataFunc = nextIterationAsync(source, selector);
  const values = await typeDataToArray(dataFunc);
  let sum3 = 0;
  for (const value of values) {
    sum3 += value;
  }
  return sum3;
};
const take = (source, amount) => {
  const amountLeft = amount > 0 ? amount : 0;
  const dataFunc = source.dataFunc;
  switch (dataFunc.type) {
    case ParallelGeneratorType.ArrayOfPromises:
      const generator1 = () => dataFunc.generator().splice(0, amountLeft);
      return new BasicParallelEnumerable({
        generator: generator1,
        type: ParallelGeneratorType.ArrayOfPromises
      });
    case ParallelGeneratorType.PromiseOfPromises:
      const generator2 = () => dataFunc.generator().then((x) => x.splice(0, amountLeft));
      return new BasicParallelEnumerable({
        generator: generator2,
        type: ParallelGeneratorType.PromiseOfPromises
      });
    case ParallelGeneratorType.PromiseToArray:
    default:
      const generator3 = () => dataFunc.generator().then((x) => x.splice(0, amountLeft));
      return new BasicParallelEnumerable({
        generator: generator3,
        type: ParallelGeneratorType.PromiseToArray
      });
  }
};
const takeWhile = (source, predicate) => {
  const generator = async () => {
    const values = await source.ToArray();
    const results = new Array();
    if (predicate.length === 1) {
      for (const value of values) {
        if (predicate(value) === true) {
          results.push(value);
        } else {
          break;
        }
      }
    } else {
      for (let i2 = 0; i2 < values.length; i2++) {
        const value = values[i2];
        if (predicate(value, i2) === true) {
          results.push(value);
        } else {
          break;
        }
      }
    }
    return results;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const takeWhileAsync = (source, predicate) => {
  const generator = async () => {
    const values = await source.ToArray();
    const results = new Array();
    if (predicate.length === 1) {
      const sPredicate = predicate;
      for (const value of values) {
        if (await sPredicate(value) === true) {
          results.push(value);
        } else {
          break;
        }
      }
    } else {
      for (let i2 = 0; i2 < values.length; i2++) {
        const value = values[i2];
        if (await predicate(value, i2) === true) {
          results.push(value);
        } else {
          break;
        }
      }
    }
    return results;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const toMap = async (source, selector) => {
  const map = /* @__PURE__ */ new Map();
  const dataFunc = nextIteration(source, (value) => {
    const key = selector(value);
    return [key, value];
  });
  const keyValues = await typeDataToArray(dataFunc);
  for (const [key, value] of keyValues) {
    const array = map.get(key);
    if (array === void 0) {
      map.set(key, [value]);
    } else {
      array.push(value);
    }
  }
  return map;
};
const toMapAsync = async (source, selector) => {
  const map = /* @__PURE__ */ new Map();
  const dataFunc = nextIterationAsync(source, async (value) => {
    const key = await selector(value);
    return [key, value];
  });
  const keyValues = await typeDataToArray(dataFunc);
  for (const [key, value] of keyValues) {
    const array = map.get(key);
    if (array === void 0) {
      map.set(key, [value]);
    } else {
      array.push(value);
    }
  }
  return map;
};
const toObject = async (source, selector) => {
  const dataFunc = source.dataFunc;
  const values = await typeDataToArray(dataFunc);
  const map = {};
  for (const value of values) {
    map[selector(value)] = value;
  }
  return map;
};
const toObjectAsync = async (source, selector) => {
  const dataFunc = nextIterationAsync(source, async (value) => {
    const key = await selector(value);
    return [key, value];
  });
  const keyValues = await typeDataToArray(dataFunc);
  const map = {};
  for (const [key, value] of keyValues) {
    map[key] = value;
  }
  return map;
};
const toSet = async (source) => {
  const dataFunc = source.dataFunc;
  const values = await typeDataToArray(dataFunc);
  return new Set(values);
};
const union = (first3, second, comparer) => {
  if (comparer) {
    return union2(first3, second, comparer);
  } else {
    return union1(first3, second);
  }
};
const union1 = (first3, second) => {
  const generator = async () => {
    const set = /* @__PURE__ */ new Set();
    const secondPromise = second.ToArray();
    for await (const item of first3) {
      if (set.has(item) === false) {
        set.add(item);
      }
    }
    const secondValues = await secondPromise;
    for (const item of secondValues) {
      if (set.has(item) === false) {
        set.add(item);
      }
    }
    return [...set.keys()];
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const union2 = (first3, second, comparer) => {
  const generator = async () => {
    const result = [];
    const values = await Promise.all([first3.ToArray(), second.ToArray()]);
    for (const source of values) {
      for (const value of source) {
        let exists = false;
        for (const resultValue of result) {
          if (comparer(value, resultValue) === true) {
            exists = true;
            break;
          }
        }
        if (exists === false) {
          result.push(value);
        }
      }
    }
    return result;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const unionAsync = (first3, second, comparer) => {
  const generator = async () => {
    const result = [];
    const values = await Promise.all([first3.ToArray(), second.ToArray()]);
    for (const source of values) {
      for (const value of source) {
        let exists = false;
        for (const resultValue of result) {
          if (await comparer(value, resultValue) === true) {
            exists = true;
            break;
          }
        }
        if (exists === false) {
          result.push(value);
        }
      }
    }
    return result;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const where = (source, predicate) => {
  const generator = async () => {
    const values = await source.ToArray();
    return values.filter(predicate);
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const whereAsync = (source, predicate) => {
  const generator = async () => {
    const dataFunc = nextIterationWithIndexAsync(source, async (value, index) => {
      const keep = await predicate(value, index);
      return [keep, value];
    });
    const valuesAsync = await typeDataToArray(dataFunc);
    const filteredValues = [];
    for (const [keep, value] of valuesAsync) {
      if (keep) {
        filteredValues.push(value);
      }
    }
    return filteredValues;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const zip = (first3, second, resultSelector) => {
  if (resultSelector) {
    return zip2(first3, second, resultSelector);
  } else {
    return zip1(first3, second);
  }
};
const zip1 = (source, second) => {
  const generator = async () => {
    const [left, right] = await Promise.all([source.ToArray(), second.ToArray()]);
    const maxLength = left.length > right.length ? left.length : right.length;
    const results = new Array(maxLength);
    for (let i2 = 0; i2 < maxLength; i2++) {
      const a2 = left[i2];
      const b2 = right[i2];
      results[i2] = [a2, b2];
    }
    return results;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const zip2 = (source, second, resultSelector) => {
  const generator = async () => {
    const [left, right] = await Promise.all([source.ToArray(), second.ToArray()]);
    const maxLength = left.length > right.length ? left.length : right.length;
    const results = new Array(maxLength);
    for (let i2 = 0; i2 < maxLength; i2++) {
      const a2 = left[i2];
      const b2 = right[i2];
      results[i2] = resultSelector(a2, b2);
    }
    return results;
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const zipAsync = (first3, second, resultSelector) => {
  const generator = async () => {
    const [left, right] = await Promise.all([first3.ToArray(), second.ToArray()]);
    const maxLength = left.length > right.length ? left.length : right.length;
    const resultPromises = new Array(maxLength);
    for (let i2 = 0; i2 < maxLength; i2++) {
      const a2 = left[i2];
      const b2 = right[i2];
      resultPromises[i2] = resultSelector(a2, b2);
    }
    return Promise.all(resultPromises);
  };
  return new BasicParallelEnumerable({
    generator,
    type: ParallelGeneratorType.PromiseToArray
  });
};
const bindLinqParallel = (object) => {
  const prototype = object.prototype;
  const bind = (func, key) => {
    const wrapped = function(...params) {
      return func(this, ...params);
    };
    Object.defineProperty(wrapped, "length", { value: func.length - 1 });
    prototype[key] = wrapped;
  };
  bind(aggregate, "Aggregate");
  bind(all, "All");
  bind(allAsync, "AllAsync");
  bind(any, "Any");
  bind(anyAsync, "AnyAsync");
  bind(asAsync, "AsAsync");
  bind(average, "Average");
  bind(averageAsync, "AverageAsync");
  bind(concatenate, "Concatenate");
  bind(contains, "Contains");
  bind(containsAsync, "ContainsAsync");
  bind(count, "Count");
  bind(countAsync, "CountAsync");
  bind(distinct, "Distinct");
  bind(distinctAsync, "DistinctAsync");
  bind(each, "Each");
  bind(eachAsync, "EachAsync");
  bind(elementAt, "ElementAt");
  bind(elementAtOrDefault, "ElementAtOrDefault");
  bind(except, "Except");
  bind(exceptAsync, "ExceptAsync");
  bind(first, "First");
  bind(firstAsync, "FirstAsync");
  bind(firstOrDefault, "FirstOrDefault");
  bind(firstOrDefaultAsync, "FirstOrDefaultAsync");
  bind(groupBy, "GroupBy");
  bind(groupByAsync, "GroupByAsync");
  bind(groupByWithSel, "GroupByWithSel");
  bind(intersect, "Intersect");
  bind(intersectAsync, "IntersectAsync");
  bind(join, "JoinByKey");
  bind(last, "Last");
  bind(lastAsync, "LastAsync");
  bind(lastOrDefault, "LastOrDefault");
  bind(lastOrDefaultAsync, "LastOrDefaultAsync");
  bind(max, "Max");
  bind(maxAsync, "MaxAsync");
  bind(min, "Min");
  bind(minAsync, "MinAsync");
  bind(ofType, "OfType");
  bind(orderBy, "OrderBy");
  bind(orderByAsync, "OrderByAsync");
  bind(orderByDescending, "OrderByDescending");
  bind(orderByDescendingAsync, "OrderByDescendingAsync");
  bind(partition, "Partition");
  bind(partitionAsync, "PartitionAsync");
  bind(reverse, "Reverse");
  bind(select, "Select");
  bind(selectAsync, "SelectAsync");
  bind(selectMany, "SelectMany");
  bind(selectManyAsync, "SelectManyAsync");
  bind(sequenceEquals, "SequenceEquals");
  bind(sequenceEqualsAsync, "SequenceEqualsAsync");
  bind(single, "Single");
  bind(singleAsync, "SingleAsync");
  bind(singleOrDefault, "SingleOrDefault");
  bind(singleOrDefaultAsync, "SingleOrDefaultAsync");
  bind(skip, "Skip");
  bind(skipWhile, "SkipWhile");
  bind(skipWhileAsync, "SkipWhileAsync");
  bind(sum, "Sum");
  bind(sumAsync, "SumAsync");
  bind(take, "Take");
  bind(takeWhile, "TakeWhile");
  bind(takeWhileAsync, "TakeWhileAsync");
  bind(toArray, "ToArray");
  bind(toMap, "ToMap");
  bind(toMapAsync, "ToMapAsync");
  bind(toObject, "ToObject");
  bind(toObjectAsync, "ToObjectAsync");
  bind(toSet, "ToSet");
  bind(union, "Union");
  bind(unionAsync, "UnionAsync");
  bind(where, "Where");
  bind(whereAsync, "WhereAsync");
  bind(zip, "Zip");
  bind(zipAsync, "ZipAsync");
};
const bindString = () => {
  const prototype = String.prototype;
  const propertyNames = Object.getOwnPropertyNames(BasicEnumerable.prototype);
  for (const prop of propertyNames) {
    prototype[prop] = prototype[prop] ?? BasicEnumerable.prototype[prop];
  }
  prototype.First = function(predicate) {
    if (predicate) {
      for (let i2 = 0; i2 < this.length; i2++) {
        const value = this[i2];
        if (predicate(value) === true) {
          return value;
        }
      }
      throw new InvalidOperationException(ErrorString.NoMatch);
    }
    if (this.length === 0) {
      throw new InvalidOperationException(ErrorString.NoElements);
    }
    return this[0];
  };
  prototype.FirstOrDefault = function(predicate) {
    if (predicate) {
      for (let i2 = 0; i2 < this.length; i2++) {
        const value = this[i2];
        if (predicate(value) === true) {
          return value;
        }
      }
      return null;
    }
    return this.length === 0 ? null : this[0];
  };
  prototype.Count = function(predicate) {
    if (predicate) {
      let count3 = 0;
      for (let i2 = 0; i2 < this.length; i2++) {
        if (predicate(this[i2]) === true) {
          count3++;
        }
      }
      return count3;
    } else {
      return this.length;
    }
  };
  prototype.ElementAt = function(index) {
    if (index < 0 || index >= this.length) {
      throw new ArgumentOutOfRangeException("index");
    }
    return this[index];
  };
  prototype.ElementAtOrDefault = function(index) {
    return this[index] || null;
  };
  prototype.Last = function(predicate) {
    if (predicate) {
      for (let i2 = this.length - 1; i2 >= 0; i2--) {
        const value = this[i2];
        if (predicate(value) === true) {
          return value;
        }
      }
      throw new InvalidOperationException(ErrorString.NoMatch);
    } else {
      if (this.length === 0) {
        throw new InvalidOperationException(ErrorString.NoElements);
      }
      return this[this.length - 1];
    }
  };
  prototype.LastOrDefault = function(predicate) {
    if (predicate) {
      for (let i2 = this.length - 1; i2 >= 0; i2--) {
        const value = this[i2];
        if (predicate(value) === true) {
          return value;
        }
      }
      return null;
    } else {
      return this.length === 0 ? null : this[this.length - 1];
    }
  };
  prototype.Reverse = function() {
    const outer = this;
    function* generator() {
      for (let i2 = outer.length - 1; i2 >= 0; i2--) {
        yield outer[i2];
      }
    }
    return new BasicEnumerable(generator);
  };
};
const initializeLinq = () => {
  bindLinq(Map);
  bindLinq(Set);
  bindString();
  bindArray(Array);
  bindArray(Int8Array);
  bindArray(Int16Array);
  bindArray(Int32Array);
  bindArray(Uint8Array);
  bindArray(Uint8ClampedArray);
  bindArray(Uint16Array);
  bindArray(Uint32Array);
  bindArray(Float32Array);
  bindArray(Float64Array);
};
bindLinq(BasicEnumerable);
bindLinqAsync(BasicAsyncEnumerable);
bindLinqParallel(BasicParallelEnumerable);
bindArrayEnumerable();
class List extends ArrayEnumerable {
  constructor(arg) {
    super();
    if (arg && typeof arg !== "number") {
      for (let item of arg) {
        this.push(item);
      }
    }
  }
  Init(from) {
    for (const item of from) {
      this.push(item);
    }
    return this;
  }
  Add(item) {
    this.push(item);
  }
  AddRange(list) {
    for (const item of list) {
      this.push(item);
    }
  }
  Remove(item) {
    let index = this.indexOf(item);
    if (index >= 0)
      this.splice(index, 1);
    return index >= 0;
  }
  RemoveAll(pred) {
    for (let i2 = this.length - 1; i2 >= 0; i2--) {
      if (pred(this[i2])) {
        this.splice(i2, 1);
      }
    }
  }
  IndexOf(item) {
    return this.indexOf(item);
  }
  Insert(index, item) {
    this.splice(index, 0, item);
  }
  RemoveAt(index) {
    this.splice(index, 1);
  }
  RemoveRange(index, count3) {
    this.splice(index, count3);
  }
  Clear() {
    this.splice(0);
  }
  Find(match) {
    for (let i2 = 0; i2 < this.length; i2++) {
      if (match(this[i2]))
        return this[i2];
    }
    return null;
  }
  Sort(comparison) {
    this.sort(comparison);
  }
  BinarySearch(item, comparer) {
    return BinarySearch(this, 0, this.length, item, comparer);
  }
}
class Stack extends List {
  Push(item) {
    this.Add(item);
  }
  Pop() {
    if (this.length === 0)
      throw new Error("Stack is empty");
    return this.splice(this.length - 1, 1)[0];
  }
}
class NumberMap extends Map {
}
class StringMap extends Map {
}
const e = Symbol("@ts-pattern/matcher"), t = "@ts-pattern/anonymous-select-key", n = (e2) => Boolean(e2 && typeof e2 == "object"), r = (t2) => t2 && !!t2[e], o = (t2, c2, i2) => {
  if (n(t2)) {
    if (r(t2)) {
      const n2 = t2[e](), { matched: r2, selections: o2 = {} } = n2.match(c2);
      return r2 && Object.keys(o2).forEach((e2) => i2(e2, o2[e2])), r2;
    }
    if (!n(c2))
      return false;
    if (Array.isArray(t2))
      return !!Array.isArray(c2) && t2.length === c2.length && t2.every((e2, t3) => o(e2, c2[t3], i2));
    if (t2 instanceof Map)
      return c2 instanceof Map && Array.from(t2.keys()).every((e2) => o(t2.get(e2), c2.get(e2), i2));
    if (t2 instanceof Set) {
      if (!(c2 instanceof Set))
        return false;
      if (t2.size === 0)
        return c2.size === 0;
      if (t2.size === 1) {
        const [e2] = Array.from(t2.values());
        return r(e2) ? Array.from(c2.values()).every((t3) => o(e2, t3, i2)) : c2.has(e2);
      }
      return Array.from(t2.values()).every((e2) => c2.has(e2));
    }
    return Object.keys(t2).every((n2) => {
      const s2 = t2[n2];
      return (n2 in c2 || r(a2 = s2) && a2[e]().matcherType === "optional") && o(s2, c2[n2], i2);
      var a2;
    });
  }
  return Object.is(c2, t2);
}, c = (t2) => {
  var o2, s2, a2;
  return n(t2) ? r(t2) ? (o2 = (s2 = (a2 = t2[e]()).getSelectionKeys) == null ? void 0 : s2.call(a2)) != null ? o2 : [] : Array.isArray(t2) ? i(t2, c) : i(Object.values(t2), c) : [];
}, i = (e2, t2) => e2.reduce((e3, n2) => e3.concat(t2(n2)), []);
function s(t2) {
  return { [e]: () => ({ match: (e2) => {
    let n2 = {};
    const r2 = (e3, t3) => {
      n2[e3] = t3;
    };
    return e2 === void 0 ? (c(t2).forEach((e3) => r2(e3, void 0)), { matched: true, selections: n2 }) : { matched: o(t2, e2, r2), selections: n2 };
  }, getSelectionKeys: () => c(t2), matcherType: "optional" }) };
}
function a(t2) {
  return { [e]: () => ({ match: (e2) => {
    if (!Array.isArray(e2))
      return { matched: false };
    let n2 = {};
    const r2 = (e3, t3) => {
      n2[e3] = (n2[e3] || []).concat([t3]);
    };
    return { matched: e2.every((e3) => o(t2, e3, r2)), selections: n2 };
  }, getSelectionKeys: () => c(t2) }) };
}
function u(...t2) {
  return { [e]: () => ({ match: (e2) => {
    let n2 = {};
    const r2 = (e3, t3) => {
      n2[e3] = t3;
    };
    return { matched: t2.every((t3) => o(t3, e2, r2)), selections: n2 };
  }, getSelectionKeys: () => i(t2, c), matcherType: "and" }) };
}
function l(...t2) {
  return { [e]: () => ({ match: (e2) => {
    let n2 = {};
    const r2 = (e3, t3) => {
      n2[e3] = t3;
    };
    return i(t2, c).forEach((e3) => r2(e3, void 0)), { matched: t2.some((t3) => o(t3, e2, r2)), selections: n2 };
  }, getSelectionKeys: () => i(t2, c), matcherType: "or" }) };
}
function h(t2) {
  return { [e]: () => ({ match: (e2) => ({ matched: !o(t2, e2, () => {
  }) }), getSelectionKeys: () => [], matcherType: "not" }) };
}
function f(t2) {
  return { [e]: () => ({ match: (e2) => ({ matched: Boolean(t2(e2)) }) }) };
}
function y(...n2) {
  const r2 = typeof n2[0] == "string" ? n2[0] : void 0, i2 = n2.length === 2 ? n2[1] : typeof n2[0] == "string" ? void 0 : n2[0];
  return { [e]: () => ({ match: (e2) => {
    let n3 = { [r2 != null ? r2 : t]: e2 };
    return { matched: i2 === void 0 || o(i2, e2, (e3, t2) => {
      n3[e3] = t2;
    }), selections: n3 };
  }, getSelectionKeys: () => [r2 != null ? r2 : t].concat(i2 === void 0 ? [] : c(i2)) }) };
}
const m = f(function(e2) {
  return true;
}), g = m, p = f(function(e2) {
  return typeof e2 == "string";
}), d = f(function(e2) {
  return typeof e2 == "number";
}), v = f(function(e2) {
  return typeof e2 == "boolean";
}), b = f(function(e2) {
  return typeof e2 == "bigint";
}), A = f(function(e2) {
  return typeof e2 == "symbol";
}), S = f(function(e2) {
  return e2 == null;
});
var w = { __proto__: null, optional: s, array: a, intersection: u, union: l, not: h, when: f, select: y, any: m, _: g, string: p, number: d, boolean: v, bigint: b, symbol: A, nullish: S, instanceOf: function(e2) {
  return f(function(e3) {
    return (t2) => t2 instanceof e3;
  }(e2));
}, typed: function() {
  return { array: a, optional: s, intersection: u, union: l, not: h, select: y, when: f };
} };
const K = (e2) => O(e2, []), O = (e2, n2) => {
  const r2 = () => {
    const t2 = n2.find(({ test: t3 }) => t3(e2));
    if (!t2) {
      let t3;
      try {
        t3 = JSON.stringify(e2);
      } catch (n3) {
        t3 = e2;
      }
      throw new Error(`Pattern matching error: no pattern matches value ${t3}`);
    }
    return t2.handler(t2.select(e2), e2);
  };
  return { with(...r3) {
    const c2 = r3[r3.length - 1], i2 = [], s2 = [];
    r3.length === 3 && typeof r3[1] == "function" ? (i2.push(r3[0]), s2.push(r3[1])) : i2.push(...r3.slice(0, r3.length - 1));
    let a2 = {};
    return O(e2, n2.concat([{ test: (e3) => Boolean(i2.some((t2) => o(t2, e3, (e4, t3) => {
      a2[e4] = t3;
    })) && s2.every((t2) => t2(e3))), handler: c2, select: (e3) => Object.keys(a2).length ? t in a2 ? a2[t] : a2 : e3 }]));
  }, when: (t2, r3) => O(e2, n2.concat([{ test: t2, handler: r3, select: (e3) => e3 }])), otherwise: (t2) => O(e2, n2.concat([{ test: () => true, handler: t2, select: (e3) => e3 }])).run(), exhaustive: () => r2(), run: r2 };
};
const initializeSystem = () => {
  initializeLinq();
  let win = window;
  win.match = K;
  win.when = w.when;
  win.clamp = function(v2, min3, max3) {
    return Math.min(Math.max(v2, min3), max3);
  };
  Object.defineProperty(String.prototype, "Insert", {
    value: function Insert(pos, str) {
      return this.slice(0, pos) + str + this.slice(pos);
    },
    writable: true,
    configurable: true
  });
  Object.defineProperty(String.prototype, "Remove", {
    value: function Remove(start, count3) {
      return this.substring(0, start) + this.substring(start + count3);
    },
    writable: true,
    configurable: true
  });
  Object.defineProperty(Number.prototype, "CompareTo", {
    value: function CompareTo(other) {
      if (this < other)
        return -1;
      if (this > other)
        return 1;
      return 0;
    },
    writable: true,
    configurable: true
  });
};
export { ArgumentException, ArgumentNullException, ArgumentOutOfRangeException, BinarySearch, DateTime, Event, Exception, Guid, IndexOutOfRangeException, InvalidOperationException, IsNullOrEmpty, List, NotImplementedException, NotSupportedException, NumberMap, OpEquality, OpInequality, Random, Stack, StringMap, StringToUint16Array, TimeSpan, initializeSystem };
