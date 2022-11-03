namespace AppBoxCore;

/// <summary>
/// 用于描述树型数据结构的全路径
/// </summary>
public sealed class TreePath
{
    public TreePath(IEnumerable<TreePathNode> nodes)
    {
        _nodes = nodes.ToArray();
    }

    private readonly TreePathNode[] _nodes;

    public int Level => _nodes.Length;

    public TreePathNode this[int index] => _nodes[index];

    public override string ToString()
    {
        var sb = StringBuilderCache.Acquire();
        for (var i = _nodes.Length - 1; i >= 0; i--)
        {
            if (i != _nodes.Length - 1) sb.Append(" / ");
            sb.Append(_nodes[i].Text);
        }

        return StringBuilderCache.GetStringAndRelease(sb);
    }
}

public readonly struct TreePathNode
{
    public readonly object Id;
    public readonly string Text;

    public TreePathNode(object id, string text)
    {
        Id = id;
        Text = text;
    }
}