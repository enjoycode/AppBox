using System.Collections.Generic;
using System.Linq;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign;

internal sealed class DesignElementTreeNode
{
    public DesignElementTreeNode(DesignElement element)
    {
        Element = element;
        var childElements = DesignController.GetAllChildrenElements(element);
        Children = new List<DesignElementTreeNode>(childElements.Select(e => new DesignElementTreeNode(e)));
    }

    public readonly DesignElement Element;
    public readonly IList<DesignElementTreeNode> Children;
}

internal sealed class DynamicOutlinePad : View
{
    public DynamicOutlinePad(DesignController designController)
    {
        _designController = designController;
        _designController.OutlineChanged += RefreshOutline;
        _treeController.SelectionChanged += OnSelectedWidget;

        Child = new Column
        {
            Children =
            {
                new TextInput(_searchKey) { Prefix = new Icon(MaterialIcons.Search) },
                new TreeView<DesignElementTreeNode>(_treeController),
            }
        };
    }

    private readonly DesignController _designController;
    private readonly TreeController<DesignElementTreeNode> _treeController = new(BuildTreeNode, n => n.Children);

    private readonly State<string> _searchKey = "";
    private Inspector? _inspector = null;

    protected override void OnMounted()
    {
        base.OnMounted();
        BuildWidgetTree();
    }

    protected override void OnUnmounted()
    {
        ClearInspector();
        base.OnUnmounted();
    }

    private static void BuildTreeNode(DesignElementTreeNode data, TreeNode<DesignElementTreeNode> node)
    {
        node.Icon = new Icon(MaterialIcons.Folder);
        node.Label = new Text(data.Element.Meta?.Name ?? "Placeholder");
        node.IsLeaf = data.Children.Count == 0;
        node.IsExpanded = !node.IsLeaf;
    }

    private void RefreshOutline()
    {
        if (IsMounted) BuildWidgetTree();
    }

    private void BuildWidgetTree()
    {
        ClearInspector();
        _treeController.DataSource = _designController.RootElement.Meta == null
            ? null
            : new List<DesignElementTreeNode> { new(_designController.RootElement) };
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

        _inspector = Inspector.Show(_treeController.FirstSelectedNode.Data.Element);
    }
}