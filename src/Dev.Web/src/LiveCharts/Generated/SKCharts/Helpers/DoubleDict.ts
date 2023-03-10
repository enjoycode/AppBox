import * as System from '@/System'

// Maybe we should go for another alternative instead of using this class..
export class DoubleDict<T1, T2> {
    private readonly _keys: System.Dictionary<T1, T2> = new System.Dictionary();
    private readonly _values: System.Dictionary<T2, T1> = new System.Dictionary();

    public Add(key: T1, value: T2) {
        this._keys.Add(key, value);
        this._values.Add(value, key);
    }

    public Remove(key: T1): boolean {
        let r2 = this._values.Remove(this._keys.GetAt(key));
        let r1 = this._keys.Remove(key);
        return r1 && r2;
    }

    // public bool Remove(T2 value)
    // {
    //     var r1 = _keys.Remove(_values[value]);
    //     var r2 = _values.Remove(value);
    //     return r1 & r2;
    // }

    public TryGetValue(key: T1, value: System.Out<T2>): boolean {
        return this._keys.TryGetValue(key, value!);
    }

    public TryGetKey(key: T2, value: System.Out<T1>): boolean {
        return this._values.TryGetValue(key, value!);
    }
}
