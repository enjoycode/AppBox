using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 子节点列表，添加时自动排序
/// </summary>
public sealed class DesignNodeList<T> where T : DesignNode
{
    internal readonly DesignNode Owner;
    private readonly List<T> _list;

    public DesignNodeList(DesignNode owner)
    {
        Owner = owner;
        _list = new List<T>();
    }

    public int Count => _list.Count;

    public T this[int index] => _list[index];

    public int Add(T item)
    {
        item.Parent = Owner;
        //特定Owner找到插入点
        if (Owner.Type is DesignNodeType.ModelRootNode or DesignNodeType.FolderNode)
        {
            var index = -1;
            for (var i = 0; i < _list.Count; i++)
            {
                if (item.CompareTo(_list[i]) < 0)
                {
                    index = i;
                    break;
                }
            }

            if (index != -1)
            {
                _list.Insert(index, item);
                return index;
            }
        }

        _list.Add(item);
        return _list.Count - 1;
    }

    public void Remove(T item)
    {
        var index = _list.IndexOf(item);
        if (index >= 0)
        {
            item.Parent = null;
            _list.RemoveAt(index);
        }
    }

    public void Clear()
    {
        foreach (var item in _list)
        {
            item.Parent = null;
        }

        _list.Clear();
    }

    public T? Find(Predicate<T> match) => _list.Find(match);

    public bool Exists(Predicate<T> match) => _list.Exists(match);

    internal void WriteTo(IOutputStream ws)
    {
        ws.WriteVariant(_list.Count);
        foreach (var item in _list)
        {
            if (Owner.Type is DesignNodeType.ModelRootNode or DesignNodeType.FolderNode)
                ws.WriteByte((byte)item.Type);
            item.WriteTo(ws);
        }
    }
}