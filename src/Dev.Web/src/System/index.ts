export type {IEnumerable} from './Linq'

export * from './Utils'

export * from './Interfaces'
export * from './Delegates'
export * from './Event'
export * from './Random'
export * from './Exceptions'
export * from './DateTime'

export * from './Collections/IList'
export * from './Collections/List'
export * from './Collections/Stack'

export type Task<T = void> = T extends void ? Promise<void> : Promise<T>;
