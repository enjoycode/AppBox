// using System;
// using System.Diagnostics;
// using AppBoxCore;
// using PixUI;
//
// namespace AppBoxDesign;
//
// internal sealed class NewNodeResult_OLD : IBinSerializable
// {
//     public NewNodeResult_OLD() { }
//
//     public DesignNodeType ParentNodeType { get; private set; }
//     public string ParentNodeId { get; private set; } = null!;
//     public DesignNodeVO NewNode { get; private set; } = null!;
//     public string? RootNodeId { get; private set; }
//     public int InsertIndex { get; private set; }
//
//     public TreeNode<DesignNodeVO> ParentNode { get; private set; } = null!;
//
//     public void WriteTo(IOutputStream ws) => throw new NotSupportedException();
//
//     public void ReadFrom(IInputStream rs)
//     {
//         ParentNodeType = (DesignNodeType)rs.ReadByte();
//         ParentNodeId = rs.ReadString()!;
//         RootNodeId = rs.ReadString();
//         InsertIndex = rs.ReadInt();
//
//         var newNodeType = (DesignNodeType)rs.ReadByte();
//         ModelRootNodeVO modelRootNode = null!;
//         NewNode = newNodeType switch
//         {
//             DesignNodeType.FolderNode => new FolderNodeVO(modelRootNode),
//             DesignNodeType.ModelNode => new ModelNodeVO(modelRootNode),
//             DesignNodeType.DataStoreNode => new DataStoreNodeVO(),
//             _ => throw new NotSupportedException()
//         };
//
//         NewNode.ReadFrom(rs);
//     }
//
//     /// <summary>
//     /// 新建的节点反序列化后映射至模型树
//     /// </summary>
//     internal void ResolveToTree(DesignStore designStore)
//     {
//         ParentNode = designStore.TreeController.FindNode(
//             n => n.Type == ParentNodeType && n.Id == ParentNodeId)!;
//         ResolveNodeToTree(NewNode, GetModelRootNode(ParentNode));
//     }
//
//     private static void ResolveNodeToTree(DesignNodeVO node, ModelRootNodeVO modelRootNode)
//     {
//         if (node is FolderNodeVO folderNode)
//         {
//             folderNode.ModelRootNode = modelRootNode;
//             Debug.Assert(folderNode.Children.Count == 0);
//             // 以下不需要，新建的没有子节点
//             // foreach (var childNode in folderNode.Children)
//             // {
//             //     ResolveNodeToTree(childNode, modelRootNode);
//             // }
//         }
//         else if (node is ModelNodeVO modelNode)
//         {
//             modelNode.ModelRootNode = modelRootNode;
//         }
//     }
//
//     private static ModelRootNodeVO GetModelRootNode(TreeNode<DesignNodeVO> parentNode)
//     {
//         return parentNode.Data.Type switch
//         {
//             DesignNodeType.ModelRootNode => (ModelRootNodeVO)parentNode.Data,
//             DesignNodeType.FolderNode => ((FolderNodeVO)parentNode.Data).ModelRootNode,
//             _ => throw new NotSupportedException()
//         };
//     }
// }