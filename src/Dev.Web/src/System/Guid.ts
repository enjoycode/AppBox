export class Guid {
    private readonly _data: Uint8Array;

    public get Value(): Uint8Array {
        return this._data;
    }

    public constructor(data: Uint8Array);
    public constructor(string: string);
    public constructor(arg: Uint8Array | string) {
        if (arg instanceof Uint8Array) {
            this._data = arg;
        } else {
            throw new Error("未实现");
        }
    }

    public static op_Equality(a: Guid, b: Guid): boolean {
        for (let i = 0; i < 16; i++) {
            if(a._data[i] != b._data[i]) return false;
        }
        return true;
    }

    public Clone(): Guid {
        return new Guid(this._data);
    }

}