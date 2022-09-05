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
        _treeController.SelectionChanged += OnSelectedWidget;

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
    private Inspector? _inspector = null;

    private static void BuildTreeNode(WidgetTreeNode data, TreeNode<WidgetTreeNode> node)
    {
        node.Icon = new Icon(Icons.Filled.Folder);
        node.Label = new Text(data.Widget.ToString());
        node.IsLeaf = data.Children.Count == 0;
        node.IsExpanded = !node.IsLeaf;
    }

    private void OnSelectedWidget()
    {
        if (_treeController.FirstSelectedNode == null)
        {
            _inspector?.Remove();
            return;
        }

        _inspector = Inspector.Show(_treeController.FirstSelectedNode.Data.Widget);
    }
}