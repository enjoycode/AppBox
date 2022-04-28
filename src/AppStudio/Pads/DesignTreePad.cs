using System.Collections.Generic;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class DesignTreePad : View
    {
        private readonly State<string> _searchKey = "";
        private readonly TreeController<IDesignNode> _treeController;

        public DesignTreePad()
        {
            _treeController = new TreeController<IDesignNode>(new List<IDesignNode>(),
                BuildTreeNode,
                n => n.Children!);

            Child = new Column
            {
                Children = new Widget[]
                {
                    new Input(_searchKey) { Prefix = new Icon(Icons.Filled.Search) },
                    new TreeView<IDesignNode>(_treeController),
                }
            };
        }

        private static void BuildTreeNode(IDesignNode data, TreeNode<IDesignNode> node)
        {
            // node.Icon = new Icon(data.Icon);
            node.Label = new Text(data.Label);
            node.IsLeaf = data.Children == null;
        }
    }
}