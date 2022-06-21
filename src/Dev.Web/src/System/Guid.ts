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
}