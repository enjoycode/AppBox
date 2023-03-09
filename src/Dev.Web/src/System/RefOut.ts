/**
 * 用于包装ref或者out的方法参数
 */
class RefOut<T> {
    public constructor(getter: () => T, setter: (T) => void) {
        this._getter = getter;
        this._setter = setter;
    }

    private readonly _getter: () => T;
    private readonly _setter: (T) => void;

    public get Value() {
        return this._getter();
    }

    public set Value(v) {
        this._setter(v);
    }
}

export class Ref<T> extends RefOut<T> {
}

export class Out<T> extends RefOut<T> {
}