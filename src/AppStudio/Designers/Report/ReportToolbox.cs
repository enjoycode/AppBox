using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class ReportToolbox : View, IDesignToolbox
{
    public ReportToolbox()
    {
        _treeController.SelectionChanged += OnSelectionChanged;
        _treeController.DataSource = ToolboxItems;

        Child = new Column
        {
            Children =
            {
                //new TextInput(_searchKey) { Suffix = new Icon(MaterialIcons.Search) },
                new TreeView<ReportToolboxItem>(_treeController, BuildTreeNode, _ => [])
                {
                    AllowDrag = false,
                    //OnAllowDrag = OnAllowDrag,
                }
            }
        };
    }

    private static readonly List<ReportToolboxItem> ToolboxItems =
    [
        new() { Name = "TextBox", Creator = () => new TextBoxDesigner(), Icon = MaterialIcons.Title },
        new() { Name = "Table", Icon = MaterialIcons.TableView },
        new() { Name = "Image", Icon = MaterialIcons.Image },
        new() { Name = "Chart", Icon = MaterialIcons.PieChart },
        new() { Name = "Barcode", Icon = MaterialIcons.QrCode },
    ];

    private readonly TreeController<ReportToolboxItem> _treeController = new();

    public IDesignToolboxItem? SelectedItem { get; private set; }

    private static void BuildTreeNode(TreeNode<ReportToolboxItem> node)
    {
        var data = node.Data;
        node.Label = new Text(data.Name);
        node.Icon = new Icon(data.Icon);
        node.IsLeaf = true;
        node.IsExpanded = true;
    }

    private void OnSelectionChanged() => SelectedItem = _treeController.FirstSelectedNode?.Data;

    public void ClearSelectedItem() => SelectedItem = null;
}

internal sealed class ReportToolboxItem : IDesignToolboxItem
{
    public string Name { get; init; }

    public IconData Icon { get; init; }

    public Func<DiagramItem> Creator { get; init; }

    bool IDesignToolboxItem.IsConnection => false;

    public DiagramItem Create() => Creator.Invoke();
}