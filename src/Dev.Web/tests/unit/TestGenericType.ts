type Func1<T> = () => T;
type Func2<T1, T2> = (arg1: T1) => T2;
type Func3<T1, T2, T3> = (arg1: T1, arg2: T2) => T3;

type Func<T1, T2 = void, T3 = void> =
    T2 extends void ? Func1<T1> :
        T3 extends void ? Func2<T1, T2> : Func3<T1, T2, T3>;

// type Func<T1, T2 = void, T3 = void> =
//     T3 extends void ?
//         T2 extends void ? Func1<T1> : Func2<T1, T2>
//         : Func3<T1, T2, T3>;
//

// export class Computed<T> {
//     private readonly _getter: Func<T>;
//
//     private constructor(getter: Func<T>) {
//         this._getter = getter;
//     }
//
//     public static Make<T1, T2, TR>(s1: T1, s2: T2, getter: Func<T1, T2, TR>): Computed<TR> {
//         let g: Func<number, Date, string> = (a, b) => a.toString();
//
//         let c = g(11, new Date());
//
//         let g2 = getter;
//         g2(s1, s2);
//
//         let r = new Computed<TR>(() => getter(s1, s2));
//         return r;
//     }
// }
