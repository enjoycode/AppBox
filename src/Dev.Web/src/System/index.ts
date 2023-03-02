export type {IEnumerable} from './Linq'
export {from as EnumerableFrom} from "./Linq/sync/static/from";

export * from './Utils'

export * from './Interfaces'
export * from './Delegates'
export * from './Event'
export * from './Random'
export * from './Exceptions'
export * from './DateTime'
export * from './Guid'
export * from './TaskCompletionSource'

export * from './Collections/IList'
export * from './Collections/List'
export * from './Collections/Stack'
export * from './Collections/Map'

export * from './InitializeSystem'

export * from './Ref'

export type Task<T = void> = T extends void ? Promise<void> : Promise<T>;
export type ValueTask<T = void> = T extends void ? Promise<void> : Promise<T>;

