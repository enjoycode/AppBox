using System;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class NewNodeResult : IBinSerializable
    {
        public DesignNodeType ParentNodeType { get; private set; }
        public string ParentNodeId { get; private set; }
        public DesignNodeVO NewNode { get; private set; }
        public string? RootNodeId { get; private set; }
        public int InsertIndex { get; private set; }

        public TreeNode<DesignNodeVO> ParentNode { get; private set; } = null!;

        public void WriteTo(IOutputStream ws) => throw new NotSupportedException();

        public void ReadFrom(IInputStream rs)
        {
            ParentNodeType = (DesignNodeType)rs.ReadByte();
            ParentNodeId = rs.ReadString()!;
            RootNodeId = rs.ReadString();
            InsertIndex = rs.ReadInt();

            //find parent node
            ParentNode = DesignStore.TreeController.FindNode(
                n => n.Type == ParentNodeType && n.Id == ParentNodeId)!;

            var newNodeType = (DesignNodeType)rs.ReadByte();
            switch (newNodeType)
            {
                case DesignNodeType.FolderNode:
                    NewNode = new FolderNodeVO(GetModelRootNode(ParentNode));
                    break;
                case DesignNodeType.ModelNode:
                    NewNode = new ModelNodeVO(GetModelRootNode(ParentNode));
                    break;
                case DesignNodeType.DataStoreNode:
                    NewNode = new DataStoreNodeVO();
                    break;
                default:
                    throw new NotSupportedException();
            }

            NewNode.ReadFrom(rs);
        }

        private static ModelRootNodeVO GetModelRootNode(TreeNode<DesignNodeVO> parentNode)
        {
            switch (parentNode.Data.Type)
            {
                case DesignNodeType.ModelRootNode: return (ModelRootNodeVO)parentNode.Data;
                case DesignNodeType.FolderNode:
                    return ((FolderNodeVO)parentNode.Data).ModelRootNode;
                default: throw new NotSupportedException();
            }
        }
    }
}