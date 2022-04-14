export const IsNullOrEmpty = function (s?: string): boolean {
    return s == null || s == '';
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
