using System.Collections.Generic;
using System.Linq;
using PixUI;

namespace System;

[TSType("Set")]
public abstract class SetBase<T>
{
    private readonly HashSet<T> _hashSet = new();

    public void add(T item) => _hashSet.Add(item);

    public void delete(T item) => _hashSet.Remove(item);

    public void clear() => _hashSet.Clear();

    public bool has(T item) => _hashSet.Contains(item);

    public ICollection<T> values() => _hashSet.ToArray();
}

[TSType("ObjectSet")]
public sealed class ObjectSet : SetBase<object> { }