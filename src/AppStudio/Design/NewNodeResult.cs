using System;
using AppBoxCore;

namespace AppBoxDesign
{
    internal sealed class NewNodeResult : IBinSerializable
    {
        public DesignNodeType ParentNodeType { get; private set; }
        public string ParentNodeId { get; private set; }
        public DesignNode NewNode { get; private set; }
        public string? RootNodeId { get; private set; }
        public int InsertIndex { get; private set; }

        public void WriteTo(IOutputStream ws) => throw new NotSupportedException();

        public void ReadFrom(IInputStream rs)
        {
            ParentNodeType = (DesignNodeType)rs.ReadByte();
            ParentNodeId = rs.ReadString()!;
            RootNodeId = rs.ReadString();
            InsertIndex = rs.ReadInt();

            var newNodeType = (DesignNodeType)rs.ReadByte();
            switch (newNodeType)
            {
                case DesignNodeType.FolderNode:
                    NewNode = new FolderNode();
                    break;
                case DesignNodeType.ModelNode:
                    NewNode = new ModelNode();
                    break;
                case DesignNodeType.DataStoreNode:
                    NewNode = new DataStoreNode();
                    break;
                default:
                    throw new NotSupportedException();
            }

            NewNode.ReadFrom(rs);
        }
    }
}