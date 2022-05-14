using System;
using System.Collections.Generic;
using AppBoxCore;

namespace AppBoxDesign
{
    internal abstract class DesignNode
    {
        public abstract DesignNodeType Type { get; }
        public virtual IList<DesignNode>? Children => null;

        public string Id { get; private set; }
        public string Label { get; private set; }

        public virtual void ReadFrom(IInputStream rs)
        {
            Id = rs.ReadString()!;
            Label = rs.ReadString()!;
        }
    }

    internal sealed class DataStoreRootNode : DesignNode
    {
        public override DesignNodeType Type => DesignNodeType.DataStoreRootNode;

        private readonly List<DesignNode> _children = new List<DesignNode>();

        public override IList<DesignNode>? Children => _children;

        public override void ReadFrom(IInputStream rs)
        {
            base.ReadFrom(rs);

            var count = rs.ReadVariant();
            for (var i = 0; i < count; i++)
            {
                var dataStoreNode = new DataStoreNode();
                dataStoreNode.ReadFrom(rs);
                _children.Add(dataStoreNode);
            }
        }
    }

    internal sealed class DataStoreNode : DesignNode
    {
        public override DesignNodeType Type => DesignNodeType.DataStoreNode;
    }

    internal sealed class ApplicationRootNode : DesignNode
    {
        public override DesignNodeType Type => DesignNodeType.ApplicationRoot;
        private readonly List<DesignNode> _children = new List<DesignNode>();
        public override IList<DesignNode>? Children => _children;

        public override void ReadFrom(IInputStream rs)
        {
            base.ReadFrom(rs);
            var count = rs.ReadVariant();
            for (var i = 0; i < count; i++)
            {
                var appNode = new ApplicationNode();
                appNode.ReadFrom(rs);
                _children.Add(appNode);
            }
        }
    }

    internal sealed class ApplicationNode : DesignNode
    {
        public override DesignNodeType Type => DesignNodeType.ApplicationNode;
        private readonly List<DesignNode> _children = new List<DesignNode>();
        public override IList<DesignNode>? Children => _children;

        public override void ReadFrom(IInputStream rs)
        {
            base.ReadFrom(rs);
            var count = rs.ReadVariant();
            for (var i = 0; i < count; i++)
            {
                var modelRootNode = new ModelRootNode();
                modelRootNode.ReadFrom(rs);
                _children.Add(modelRootNode);
            }
        }
    }

    internal sealed class ModelRootNode : DesignNode
    {
        public override DesignNodeType Type => DesignNodeType.ModelRootNode;

        private readonly List<DesignNode> _children = new List<DesignNode>();
        public override IList<DesignNode>? Children => _children;

        public override void ReadFrom(IInputStream rs)
        {
            base.ReadFrom(rs);

            var count = rs.ReadVariant();
            for (var i = 0; i < count; i++)
            {
                var nodeType = (DesignNodeType)rs.ReadByte();
                DesignNode node;
                if (nodeType == DesignNodeType.ModelNode)
                    node = new ModelNode();
                else if (nodeType == DesignNodeType.FolderNode)
                    throw new NotImplementedException();
                else
                    throw new NotSupportedException();

                node.ReadFrom(rs);
                _children.Add(node);
            }
        }
    }

    internal sealed class ModelNode : DesignNode
    {
        public override DesignNodeType Type => DesignNodeType.ModelNode;

        public ModelType ModelType { get; private set; }

        public override void ReadFrom(IInputStream rs)
        {
            base.ReadFrom(rs);
            ModelType = (ModelType)rs.ReadByte();
        }
    }
}