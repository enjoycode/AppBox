using AppBoxStore.Entities;
using PixUI;

namespace AppBoxDesign;

/// <summary>
/// 设计时通用的组织结构树Widget
/// </summary>
internal sealed class OrgUnitTreeView : SingleChildWidget
{
    public OrgUnitTreeView(IList<OrgUnit> orgUnits)
    {
        _treeController = new TreeController<OrgUnit>();
        _treeController.DataSource = orgUnits;
        _treeController.SelectionChanged += OnSelectionChanged;

        Child = new TreeView<OrgUnit>(_treeController, BuildTreeNode, n => n.Children);
    }

    private readonly TreeController<OrgUnit> _treeController;

    public Action<OrgUnit>? OnSelected { get; set; }

    private void OnSelectionChanged()
    {
        if (_treeController.FirstSelectedNode == null)
            return;
        OnSelected?.Invoke(_treeController.FirstSelectedNode.Data);
    }

    private static void BuildTreeNode(TreeNode<OrgUnit> node)
    {
        node.Label = new Text(node.Data.Name);
        if (node.Data.BaseType == Enterprise.MODELID)
        {
            node.Icon = new Icon(MaterialIcons.Home);
            node.IsLeaf = false;
            node.IsExpanded = true;
        }
        else if (node.Data.BaseType == Workgroup.MODELID)
        {
            node.Icon = new Icon(MaterialIcons.Folder);
            node.IsLeaf = false;
            node.IsExpanded = true;
        }
        else
        {
            node.Icon = new Icon(MaterialIcons.Person);
            node.IsLeaf = true;
        }
    }
}