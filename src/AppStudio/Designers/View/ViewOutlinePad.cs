using System;
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
        _treeController.SelectionChanged += OnSelectedWidget;
        BuildWidgetTree();

        Child = new Column
        {
            Children = new Widget[]
            {
                new Input(_searchKey) { Prefix = new Icon(MaterialIcons.Search) },
                new TreeView<WidgetTreeNode>(_treeController),
            }
        };
    }

    private readonly PreviewController _previewController;

    private readonly TreeController<WidgetTreeNode> _treeController =
        new TreeController<WidgetTreeNode>(BuildTreeNode, n => n.Children);

    private readonly State<string> _searchKey = "";
    private Inspector? _inspector = null;


    protected override void OnMounted()
    {
        _previewController.RefreshOutlineAction = BuildWidgetTree;
    }
    protected override void OnUnmounted()
    {
        ClearInspector();
        _previewController.RefreshOutlineAction = null;
    }

    private static void BuildTreeNode(WidgetTreeNode data, TreeNode<WidgetTreeNode> node)
    {
        node.Icon = new Icon(MaterialIcons.Folder);
        node.Label = new Text(data.Widget.ToString());
        node.IsLeaf = data.Children.Count == 0;
        node.IsExpanded = !node.IsLeaf;
    }

    private void BuildWidgetTree()
    {
        ClearInspector();
        _treeController.DataSource = new List<WidgetTreeNode>()
            { _previewController.GetWidgetTree()! };
    }

    private void ClearInspector()
    {
        _inspector?.Remove();
        _inspector = null;
    }

    private void OnSelectedWidget()
    {
        if (_treeController.FirstSelectedNode == null)
        {
            ClearInspector();
            return;
        }

        _inspector = Inspector.Show(_treeController.FirstSelectedNode.Data.Widget);
    }
}