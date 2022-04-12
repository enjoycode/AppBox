export type {IEnumerable} from './Linq'

export * from './IDisposable'
export * from './IEquatable'
export * from './Delegates'
export * from './Event'
export * from './Random'
export * from './Exceptions'
export * from './DateTime'

export * from './Collections'
export * from './Utils'

export type Task<T = void> = T extends void ? Promise<void> : Promise<T>;

// export function IsInterfaceOf<T>(obj: any, name: string): obj is T {
//     return typeof obj === "object" && obj !== null && !Array.isArray(obj)
//         && ('ScrollController' in obj && typeof obj['ScrollController'] === "function");
// }
