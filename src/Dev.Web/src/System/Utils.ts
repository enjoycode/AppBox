import {IComparer} from './Interfaces'

export const IsNullOrEmpty = function (s?: string): boolean {
    return s == null || s.length === 0;
}

export const OpEquality = function (a: any, b: any): boolean {
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    return a.constructor.op_Equality(a, b);
}

export const OpInequality = function (a: any, b: any): boolean {
    return !OpEquality(a, b);
}

export const StringToUint16Array = function (str: string): Uint16Array {
    let buf = new Uint16Array(str.length);
    for (let i = 0; i < str.length; i++) {
        buf[i] = str.charCodeAt(i);
    }
    return buf;
}

export const BinarySearch = function <T>(array: ArrayLike<T>, index: number, length: number,
                                         value: T, comparer: IComparer<T>): number {
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
}