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

    private TreePathNode[] _nodes;

    public TreePathNode this[int index] => _nodes[index];
}

public readonly struct TreePathNode
{
    public readonly Guid Id;
    public readonly string Text;

    public TreePathNode(Guid id, string text)
    {
        Id = id;
        Text = text;
    }
}