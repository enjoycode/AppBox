export type {IEnumerable} from './Linq'
export {NumberComparer, from as EnumerableFrom} from './Linq'

export * from './Utils'

export * from './Interfaces'
export * from './Delegates'
export * from './Event'
export * from './Random'
export * from './Exceptions'
export * from './DateTime'
export * from './Guid'
export * from './TaskCompletionSource'
export * from './Tuple'
export * from './Stopwatch'

export * from './Collections/IList'
export * from './Collections/List'
export * from './Collections/Dictionary'
export * from './Collections/Stack'
export * from './Collections/HashSet'
export * from './Collections/LinkedList'
export * from './Collections/ObservableCollection'

export * from './InitializeSystem'

export * from './RefOut'

export type Task<T = void> = T extends void ? Promise<void> : Promise<T>;
export type ValueTask<T = void> = T extends void ? Promise<void> : Promise<T>;

