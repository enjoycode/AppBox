using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using PixUI;

namespace System;
//用于简单转换为Web的Map<string,T> or Map<number,T>

[TSType("Map")]
[SuppressMessage("ReSharper", "InconsistentNaming")]
public abstract class MapBase<K, V>
{
    private readonly Dictionary<K, V> _dictionary = new();

    protected MapBase(ValueTuple<K, V>[]? items = null)
    {
        if (items != null)
        {
            foreach (var entry in items)
            {
                _dictionary.Add(entry.Item1, entry.Item2);
            }
        }
    }

    public int size => _dictionary.Count;
    [TSRename("size")]
    public int Count => _dictionary.Count;

    public IEnumerable<K> Keys => _dictionary.Keys;
    public IEnumerable<V> Values => _dictionary.Values;

    public V? get(K key)
    {
        _dictionary.TryGetValue(key, out var value);
        return value;
    }

    [TSRename("set")]
    public void Add(K key, V value) => _dictionary.Add(key, value);
    
    public void set(K key, V value) =>_dictionary[key] = value;
    
    public bool has(K key) => _dictionary.ContainsKey(key);

    [TSRename("delete")]
    public bool Remove(K key) => _dictionary.Remove(key);

    public bool delete(K key) => _dictionary.Remove(key);

    [TSRename("clear")]
    public void Clear() => _dictionary.Clear();

    [TSRename("has")]
    public bool ContainsKey(K key) => _dictionary.ContainsKey(key);

    public ICollection<K> keys() => _dictionary.Keys;

    public ICollection<V> values() => _dictionary.Values;
}

[TSType("System.NumberMap")]
public sealed class NumberMap<T> : MapBase<int, T>
{
    public NumberMap(ValueTuple<int, T>[]? items = null) : base(items) { }
}

[TSType("System.DoubleMap")]
public sealed class DoubleMap<T> : MapBase<double, T>
{
    public DoubleMap(ValueTuple<double, T>[]? items = null) : base(items) { }
}

[TSType("System.StringMap")]
public sealed class StringMap<T> : MapBase<string, T>
{
    public StringMap(ValueTuple<string, T>[]? items = null) : base(items) { }
}

[TSType("System.ObjectMap")]
public sealed class ObjectMap<T> : MapBase<object, T>
{
    public ObjectMap(ValueTuple<object, T>[]? items = null) : base(items) { }
}