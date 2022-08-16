using System;
using System.Collections.Generic;
using AppBoxCore;

namespace AppBoxDesign
{
    internal sealed class DesignTreeVO : IBinSerializable
    {
        public readonly List<DesignNodeVO> RootNodes = new List<DesignNodeVO>();

        public void WriteTo(IOutputStream ws) => throw new NotSupportedException();

        public void ReadFrom(IInputStream rs)
        {
            var count = rs.ReadVariant();
            for (var i = 0; i < count; i++)
            {
                var nodeType = (DesignNodeType)rs.ReadByte();
                DesignNodeVO node;
                if (nodeType == DesignNodeType.DataStoreRootNode)
                    node = new DataStoreRootNodeVO();
                else if (nodeType == DesignNodeType.ApplicationRoot)
                    node = new ApplicationRootNodeVO();
                else
                    throw new NotSupportedException();
                node.ReadFrom(rs);
                RootNodes.Add(node);
            }
        }
    }
}