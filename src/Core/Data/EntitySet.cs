using System.Collections;

namespace AppBoxCore;

public sealed class EntitySet<T> : IEnumerable<T>, IBinSerializable where T : Entity, new()
{
    /// <summary>
    /// 创建EntitySet实例
    /// </summary>
    /// <param name="entityRefSetter">添加或移除时设置相应的EntityRef引用 eg: (t,toNull) => t.Order = toNull ? null : this </param>
    public EntitySet(Action<T, bool> entityRefSetter)
    {
        _entityRefSetter = entityRefSetter;
        _list = new List<T>();
    }

    private readonly Action<T, bool> _entityRefSetter;
    private readonly List<T> _list;
    private List<T>? _removed; //已删除的已持久化的实例

    /// <summary>
    /// 已移除的项目
    /// </summary>
    public IList<T>? RemovedList => _removed;

    public void Add(T item)
    {
        _entityRefSetter(item, false);
        _list.Add(item);
    }

    public void Insert(int index, T item)
    {
        _entityRefSetter(item, false);
        _list.Insert(index, item);
    }

    public bool Remove(T item)
    {
        var res = _list.Remove(item);
        if (res)
            RemoveInternal(item);
        return res;
    }

    public void RemoveAt(int index)
    {
        RemoveInternal(_list[index]);
        _list.RemoveAt(index);
    }

    public void Clear()
    {
        foreach (var item in _list)
        {
            RemoveInternal(item);
        }

        _list.Clear();
    }

    private void RemoveInternal(T item)
    {
        if (item is DbEntity dbEntity && dbEntity.PersistentState != PersistentState.Detached)
        {
            _removed ??= new List<T>();
            _removed.Add(item);
        }

        _entityRefSetter(item, true);
    }

    public T this[int index] => _list[index]; // 为兼容Web只读

    public int Count => _list.Count;

    public int IndexOf(T item) => _list.IndexOf(item);
    public bool Contains(T item) => _list.Contains(item);

    public IEnumerator<T> GetEnumerator() => _list.GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();

    void IBinSerializable.WriteTo(IOutputStream ws)
    {
        ws.WriteVariant(_list.Count);
        foreach (var item in _list)
        {
            ws.Serialize(item);
        }

        ws.WriteVariant(_removed?.Count ?? 0);
        if (_removed != null)
        {
            foreach (var item in _removed)
            {
                ws.Serialize(item);
            }
        }
    }

    void IBinSerializable.ReadFrom(IInputStream rs)
    {
        var count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            _list.Add(rs.DeserializeEntity(() => new T())!); //直接加入列表
        }

        count = rs.ReadVariant();
        if (count > 0)
        {
            _removed = new List<T>(count);
            for (var i = 0; i < count; i++)
            {
                _removed.Add(rs.DeserializeEntity(() => new T())!);
            }
        }
    }
}