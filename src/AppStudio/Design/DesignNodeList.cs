using System.Collections;
using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 子节点列表，添加时自动排序
/// </summary>
public sealed class DesignNodeList<T> : IEnumerable<T> where T : DesignNode
{
    internal readonly DesignNode Owner;
    internal readonly List<T> List;

    public DesignNodeList(DesignNode owner)
    {
        Owner = owner;
        List = new List<T>();
    }

    public int Count => List.Count;

    public T this[int index] => List[index];

    public int Add(T item)
    {
        item.Parent = Owner;
        //特定Owner找到插入点
        if (Owner.Type is DesignNodeType.ModelRootNode or DesignNodeType.FolderNode)
        {
            var index = -1;
            for (var i = 0; i < List.Count; i++)
            {
                if (item.CompareTo(List[i]) < 0)
                {
                    index = i;
                    break;
                }
            }

            if (index != -1)
            {
                List.Insert(index, item);
                return index;
            }
        }

        List.Add(item);
        return List.Count - 1;
    }

    public void Remove(T item)
    {
        var index = List.IndexOf(item);
        if (index >= 0)
        {
            item.Parent = null;
            List.RemoveAt(index);
        }
    }

    public void Clear()
    {
        foreach (var item in List)
        {
            item.Parent = null;
        }

        List.Clear();
    }

    public T? Find(Predicate<T> match) => List.Find(match);

    public bool Exists(Predicate<T> match) => List.Exists(match);

    public IEnumerator<T> GetEnumerator() => List.GetEnumerator();
    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}