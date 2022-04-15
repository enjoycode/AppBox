//https://www.typescriptlang.org/docs/handbook/2/conditional-types.html

// Action
type Action0 = () => void;
type Action1<T1> = (arg: T1) => void;
type Action2<T1, T2> = (arg1: T1, arg2: T2) => void;
type Action3<T1, T2, T3> = (arg1: T1, arg2: T2, arg3: T3) => void;
type Action4<T1, T2, T3, T4> = (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => void;
type Action5<T1, T2, T3, T4, T5> = (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => void;

export type Action<T1 = void, T2 = void, T3 = void, T4 = void, T5 = void> =
    T1 extends void ? Action0 :
        T2 extends void ? Action1<T1> :
            T3 extends void ? Action2<T1, T2> :
                T4 extends void ? Action3<T1, T2, T3> :
                    T5 extends void ? Action4<T1, T2, T3, T4> :
                        Action5<T1, T2, T3, T4, T5>;

// Func
type Func1<T> = () => T;
type Func2<T1, T2> = (arg1: T1) => T2;
type Func3<T1, T2, T3> = (arg1: T1, arg2: T2) => T3;
type Func4<T1, T2, T3, T4> = (arg1: T1, arg2: T2, arg3: T3) => T4;
type Func5<T1, T2, T3, T4, T5> = (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => T5;
type Func6<T1, T2, T3, T4, T5, T6> = (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => T6;

export type Func<T1, T2 = void, T3 = void, T4 = void, T5 = void, T6 = void> =
    T2 extends void ? Func1<T1> :
        T3 extends void ? Func2<T1, T2> :
            T4 extends void ? Func3<T1, T2, T3> :
                T5 extends void ? Func4<T1, T2, T3, T4> :
                    T6 extends void ? Func5<T1, T2, T3, T4, T5> :
                        Func6<T1, T2, T3, T4, T5, T6>;

export type Predicate<T> = (arg: T) => boolean;

export type Comparison<T> = (x: T, y: T) => number;
