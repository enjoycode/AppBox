using System;
using System.Collections.Generic;
using PixUI;
using AppBoxCore;

namespace AppBoxDesign
{
    internal abstract class DesignNodeVO
    {
        public abstract DesignNodeType Type { get; }
        public virtual IList<DesignNodeVO>? Children => null;

        public string Id { get; protected set; } = null!;
        public readonly State<string> Label = "None";

        /// <summary>
        /// 当前节点打开的设计器，打开时设置关闭时取消
        /// </summary>
        internal IDesigner? Designer { get; set; }

        public override string ToString() => Label.Value;

        public virtual void ReadFrom(IInputStream rs)
        {
            Id = rs.ReadString()!;
            Label.Value = rs.ReadString()!;
        }
    }

    internal sealed class DataStoreRootNodeVO : DesignNodeVO
    {
        public override DesignNodeType Type => DesignNodeType.DataStoreRootNode;

        private readonly List<DesignNodeVO> _children = new List<DesignNodeVO>();

        public override IList<DesignNodeVO>? Children => _children;

        public override void ReadFrom(IInputStream rs)
        {
            base.ReadFrom(rs);

            var count = rs.ReadVariant();
            for (var i = 0; i < count; i++)
            {
                var dataStoreNode = new DataStoreNodeVO();
                dataStoreNode.ReadFrom(rs);
                _children.Add(dataStoreNode);
            }
        }
    }

    internal sealed class DataStoreNodeVO : DesignNodeVO
    {
        public static readonly DataStoreNodeVO None = new();

        public override DesignNodeType Type => DesignNodeType.DataStoreNode;
    }

    internal sealed class ApplicationRootNodeVO : DesignNodeVO
    {
        public override DesignNodeType Type => DesignNodeType.ApplicationRoot;
        private readonly List<DesignNodeVO> _children = new List<DesignNodeVO>();
        public override IList<DesignNodeVO>? Children => _children;

        public override void ReadFrom(IInputStream rs)
        {
            base.ReadFrom(rs);
            var count = rs.ReadVariant();
            for (var i = 0; i < count; i++)
            {
                var appNode = new ApplicationNodeVO();
                appNode.ReadFrom(rs);
                _children.Add(appNode);
            }
        }
    }

    internal sealed class ApplicationNodeVO : DesignNodeVO
    {
        public override DesignNodeType Type => DesignNodeType.ApplicationNode;
        private readonly List<DesignNodeVO> _children = new List<DesignNodeVO>();
        public override IList<DesignNodeVO>? Children => _children;

        public override void ReadFrom(IInputStream rs)
        {
            base.ReadFrom(rs);
            var count = rs.ReadVariant();
            for (var i = 0; i < count; i++)
            {
                var modelRootNode = new ModelRootNodeVO(this);
                modelRootNode.ReadFrom(rs);
                _children.Add(modelRootNode);
            }
        }
    }

    internal sealed class ModelRootNodeVO : DesignNodeVO
    {
        public ModelRootNodeVO(ApplicationNodeVO applicationNode)
        {
            ApplicationNode = applicationNode;
        }

        public readonly ApplicationNodeVO ApplicationNode;

        public override DesignNodeType Type => DesignNodeType.ModelRootNode;

        private readonly List<DesignNodeVO> _children = new List<DesignNodeVO>();
        public override IList<DesignNodeVO>? Children => _children;

        public override void ReadFrom(IInputStream rs)
        {
            base.ReadFrom(rs);

            var count = rs.ReadVariant();
            for (var i = 0; i < count; i++)
            {
                var nodeType = (DesignNodeType)rs.ReadByte();
                DesignNodeVO node;
                if (nodeType == DesignNodeType.ModelNode)
                    node = new ModelNodeVO(this);
                else if (nodeType == DesignNodeType.FolderNode)
                    node = new FolderNodeVO(this);
                else
                    throw new NotSupportedException();

                node.ReadFrom(rs);
                _children.Add(node);
            }
        }
    }

    internal sealed class FolderNodeVO : DesignNodeVO
    {
        public FolderNodeVO(ModelRootNodeVO modelRootNode)
        {
            ModelRootNode = modelRootNode;
        }

        public readonly ModelRootNodeVO ModelRootNode;

        public override DesignNodeType Type => DesignNodeType.FolderNode;

        private readonly List<DesignNodeVO> _children = new List<DesignNodeVO>();
        public override IList<DesignNodeVO>? Children => _children;

        public override void ReadFrom(IInputStream rs)
        {
            base.ReadFrom(rs);

            var count = rs.ReadVariant();
            for (var i = 0; i < count; i++)
            {
                var nodeType = (DesignNodeType)rs.ReadByte();
                DesignNodeVO node;
                if (nodeType == DesignNodeType.ModelNode)
                    node = new ModelNodeVO(ModelRootNode);
                else if (nodeType == DesignNodeType.FolderNode)
                    node = new FolderNodeVO(ModelRootNode);
                else
                    throw new NotSupportedException();

                node.ReadFrom(rs);
                _children.Add(node);
            }
        }
    }

    internal sealed class ModelNodeVO : DesignNodeVO
    {
        public ModelNodeVO(ModelRootNodeVO modelRootNode)
        {
            ModelRootNode = modelRootNode;
        }

        public readonly ModelRootNodeVO ModelRootNode;

        public string AppName => ModelRootNode.ApplicationNode.Label.Value;

        public override DesignNodeType Type => DesignNodeType.ModelNode;

        public ModelType ModelType { get; private set; }

        public override void ReadFrom(IInputStream rs)
        {
            base.ReadFrom(rs);
            ModelType = (ModelType)rs.ReadByte();
        }
    }
}