//https://www.typescriptlang.org/docs/handbook/2/conditional-types.html

// Action
export type Action = () => void;
export type Action1<T1> = (arg: T1) => void;
export type Action2<T1, T2> = (arg1: T1, arg2: T2) => void;
export type Action3<T1, T2, T3> = (arg1: T1, arg2: T2, arg3: T3) => void;
export type Action4<T1, T2, T3, T4> = (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => void;
export type Action5<T1, T2, T3, T4, T5> = (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => void;

// export type Action<T1 = void, T2 = void, T3 = void, T4 = void, T5 = void> =
//     T1 extends void ? Action :
//         T2 extends void ? Action1<T1> :
//             T3 extends void ? Action2<T1, T2> :
//                 T4 extends void ? Action3<T1, T2, T3> :
//                     T5 extends void ? Action4<T1, T2, T3, T4> :
//                         Action5<T1, T2, T3, T4, T5>;

// Func
export type Func1<T> = () => T;
export type Func2<T1, T2> = (arg1: T1) => T2;
export type Func3<T1, T2, T3> = (arg1: T1, arg2: T2) => T3;
export type Func4<T1, T2, T3, T4> = (arg1: T1, arg2: T2, arg3: T3) => T4;
export type Func5<T1, T2, T3, T4, T5> = (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => T5;
export type Func6<T1, T2, T3, T4, T5, T6> = (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => T6;

// export type Func<T1, T2 = void, T3 = void, T4 = void, T5 = void, T6 = void> =
//     T2 extends void ? Func1<T1> :
//         T3 extends void ? Func2<T1, T2> :
//             T4 extends void ? Func3<T1, T2, T3> :
//                 T5 extends void ? Func4<T1, T2, T3, T4> :
//                     T6 extends void ? Func5<T1, T2, T3, T4, T5> :
//                         Func6<T1, T2, T3, T4, T5, T6>;

export type Predicate<T> = (arg: T) => boolean;

export type Comparison<T> = (x: T, y: T) => number;
