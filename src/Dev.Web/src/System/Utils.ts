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
