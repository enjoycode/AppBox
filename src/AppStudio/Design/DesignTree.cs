using System;
using System.Collections.Generic;
using AppBoxCore;

namespace AppBoxDesign
{
    internal sealed class DesignTree : IBinSerializable
    {
        public readonly List<DesignNode> RootNodes = new List<DesignNode>();

        public void WriteTo(IOutputStream ws) => throw new NotSupportedException();

        public void ReadFrom(IInputStream rs)
        {
            var count = rs.ReadVariant();
            for (var i = 0; i < count; i++)
            {
                var nodeType = (DesignNodeType)rs.ReadByte();
                DesignNode node;
                if (nodeType == DesignNodeType.DataStoreRootNode)
                    node = new DataStoreRootNode();
                else if (nodeType == DesignNodeType.ApplicationRoot)
                    node = new ApplicationRootNode();
                else
                    throw new NotSupportedException();
                node.ReadFrom(rs);
                RootNodes.Add(node);
            }
        }
    }
}