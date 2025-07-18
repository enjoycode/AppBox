using PixUI;

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
    public TreeNode<DesignNode> ParentNode { get; private set; } = null!;

    /// <summary>
    /// 用于判断模型根节点是否已签出(非自动签出)，前端据此判断是否需要刷新模型根节点
    /// </summary>
    public readonly string? RootNodeId;

    /// <summary>
    /// 用于前端处理插入点，由后端排好序后返回给前端，省得前端处理排序问题
    /// </summary>
    public readonly int InsertIndex;

    /// <summary>
    /// 新建的节点反序列化后映射至模型树
    /// </summary>
    internal void ResolveToTree(DesignStore designStore)
    {
        ParentNode = designStore.TreeController.FindNode(
            n => n.Type == ParentNodeType && n.Id == ParentNodeId)!;
        // ResolveNodeToTree(NewNode, GetModelRootNode(ParentNode));
    }

    // private static void ResolveNodeToTree(DesignNode node, ModelRootNode modelRootNode)
    // {
    //     if (node is FolderNode folderNode)
    //     {
    //         folderNode.ModelRootNode = modelRootNode;
    //         Debug.Assert(folderNode.Children.Count == 0);
    //         // 以下不需要，新建的没有子节点
    //         // foreach (var childNode in folderNode.Children)
    //         // {
    //         //     ResolveNodeToTree(childNode, modelRootNode);
    //         // }
    //     }
    //     else if (node is ModelNode modelNode)
    //     {
    //         modelNode.ModelRootNode = modelRootNode;
    //     }
    // }
    //
    // private static ModelRootNode GetModelRootNode(TreeNode<DesignNode> parentNode)
    // {
    //     return parentNode.Data.Type switch
    //     {
    //         DesignNodeType.ModelRootNode => (ModelRootNode)parentNode.Data,
    //         DesignNodeType.FolderNode => ((FolderNode)parentNode.Data).ModelRootNode,
    //         _ => throw new NotSupportedException()
    //     };
    // }
}