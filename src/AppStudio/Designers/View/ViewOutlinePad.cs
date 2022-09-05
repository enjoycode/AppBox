using System.Collections.Generic;
using PixUI;

namespace AppBoxDesign;

/// <summary>
/// 视图模型设计器的大纲视图
/// </summary>
internal sealed class ViewOutlinePad : View
{
    public ViewOutlinePad(PreviewController previewController)
    {
        _previewController = previewController;
        _treeController.DataSource = new List<WidgetTreeNode>()
            { previewController.GetWidgetTree()! };

        Child = new Column
        {
            Children = new Widget[]
            {
                new Input(_searchKey) { Prefix = new Icon(Icons.Filled.Search) },
                new TreeView<WidgetTreeNode>(_treeController),
            }
        };
    }

    private readonly PreviewController _previewController;

    private readonly TreeController<WidgetTreeNode> _treeController =
        new TreeController<WidgetTreeNode>(BuildTreeNode, n => n.Children);

    private readonly State<string> _searchKey = "";

    private static void BuildTreeNode(WidgetTreeNode data, TreeNode<WidgetTreeNode> node)
    {
        node.Icon = new Icon(Icons.Filled.Folder);
        node.Label = new Text(data.Label);
        node.IsLeaf = data.Children.Count == 0;
        node.IsExpanded = !node.IsLeaf;
    }
}