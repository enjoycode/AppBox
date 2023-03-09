import {ArgumentException, IEnumerable, Out, EnumerableFrom} from "@/System";

export class KeyValuePair<TKey, TValue> {
    public constructor(key: TKey, value: TValue) {
        this.Key = key;
        this.Value = value;
    }

    public readonly Key: TKey;
    public readonly Value: TValue;
}

export class Dictionary<TKey = any, TValue = any> {
    //TODO:暂简单用js map实现，待重写与C#一致

    public constructor(capacity?: number) {
        //暂忽略capacity
    }

    private readonly map: Map<TKey, TValue> = new Map<TKey, TValue>();

    public Init(entries: readonly (readonly [TKey, TValue])[]): Dictionary<TKey, TValue> {
        for (const entry of entries) {
            this.map.set(entry[0], entry[1]);
        }
        return this;
    }

    public get length() {
        return this.map.size;
    }

    public get Keys(): IEnumerable<TKey> {
        return EnumerableFrom(this.map.keys());
    }

    public get Values(): IEnumerable<TValue> {
        return EnumerableFrom(this.map.values());
    }

    public ContainsKey(key: TKey): boolean {
        return this.map.has(key);
    }

    public GetAt(key: TKey): TValue {
        if (!this.map.has(key))
            throw new ArgumentException("Key not exists");
        return this.map.get(key);
    }

    public SetAt(key: TKey, value: TValue) {
        this.map.set(key, value);
    }

    public TryGetValue(key: TKey, value: Out<TValue>): boolean {
        let res = this.map.get(key);
        if (res !== undefined) {
            value.Value = res;
            return true;
        }
        return false;
    }

    public Add(key: TKey, value: TValue) {
        if (this.map.has(key))
            throw new ArgumentException("Key already exists");
        this.map.set(key, value);
    }

    public Remove(key: TKey): boolean {
        if (this.map.has(key)) {
            this.map.delete(key);
            return true;
        }
        return false;
    }

    public Clear(): void {
        this.map.clear();
    }

    *[Symbol.iterator](): IterableIterator<KeyValuePair<TKey, TValue>> {
        for (const entry of this.map.entries()) {
            yield new KeyValuePair<TKey, TValue>(entry[0], entry[1]);
        }
    }
}