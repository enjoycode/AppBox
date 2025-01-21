namespace AppBoxDesign;

/// <summary>
/// 新建节点后返回给前端的结果
/// </summary>
public sealed class NewNodeResult
{
    public NewNodeResult(DesignNodeType parentNodeType, string parentNodeId, DesignNode newNode,
        string? rootNodeId, int insertIndex)
    {
        ParentNodeType = parentNodeType;
        ParentNodeId = parentNodeId;
        NewNode = newNode;
        RootNodeId = rootNodeId;
        InsertIndex = insertIndex;
    }

    public readonly DesignNodeType ParentNodeType;
    public readonly string ParentNodeId;
    public readonly DesignNode NewNode;

    /// <summary>
    /// 用于判断模型根节点是否已签出(非自动签出)，前端据此判断是否需要刷新模型根节点
    /// </summary>
    public readonly string? RootNodeId;

    /// <summary>
    /// 用于前端处理插入点，由后端排好序后返回给前端，省得前端处理排序问题
    /// </summary>
    public readonly int InsertIndex;
}