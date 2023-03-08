import {IEnumerable} from "@/System";
import {from} from "@/System/Linq";

class MapBase<TKey, TValue> extends Map<TKey, TValue> {
    public get Keys(): IEnumerable<TKey> {
        return from(this.keys());
    }

    public get Values(): IEnumerable<TValue> {
        return from(this.values());
    }

    public Add(key: TKey, value: TValue) {
        this.set(key, value);
    }

    public Remove(key: TKey) {
        this.delete(key);
    }

    public Clear() {
        this.clear();
    }
}

export class NumberMap<T> extends MapBase<number, T> {}

export class StringMap<T> extends MapBase<string, T> {}

export class DoubleMap<T> extends MapBase<number, T> {}

export class ObjectMap<T> extends MapBase<any, T> {}