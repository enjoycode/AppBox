using System.Collections.Generic;
using PixUI;

namespace AppBoxDev
{
    internal sealed class DesignTreePad : View
    {
        private readonly State<string> _searchKey = "";
        private readonly TreeController<DesignNode> _treeController;

        public DesignTreePad()
        {
            _treeController = new TreeController<DesignNode>(new List<DesignNode>(), BuildTreeNode,
                n => n.Children!);

            Child = new Column
            {
                Children = new Widget[]
                {
                    new Input(_searchKey) { Prefix = new Icon(Icons.Filled.Search) },
                    new TreeView<DesignNode>(_treeController),
                }
            };
        }

        private static void BuildTreeNode(DesignNode data, TreeNode<DesignNode> node)
        {
            // node.Icon = new Icon(data.Icon);
            // node.Label = new Text(data.Text);
            node.IsLeaf = data.Children == null;
        }
    }
}