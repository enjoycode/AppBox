using AppBoxDesign.Diagram;
using AppBoxDesign.Reporting;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class ReportToolbox : View, IDiagramToolbox
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
                new TreeView<DiagramToolboxItem>(_treeController, BuildTreeNode, _ => [])
                {
                    AllowDrag = false,
                    //OnAllowDrag = OnAllowDrag,
                }
            }
        };
    }

    private static readonly List<DiagramToolboxItem> ToolboxItems =
    [
        new() { Name = "TextBox", Creator = () => new TextBoxDesigner(), Icon = MaterialIcons.Title },
        new() { Name = "Table", Creator = () => new TableDesigner(), Icon = MaterialIcons.TableView },
        new() { Name = "Image", Icon = MaterialIcons.Image },
        new() { Name = "Chart", Icon = MaterialIcons.PieChart },
        new() { Name = "Barcode", Creator = () => new BarcodeDesigner(), Icon = MaterialIcons.QrCode },
    ];

    private readonly TreeController<DiagramToolboxItem> _treeController = new();

    public IDiagramToolboxItem? SelectedItem { get; private set; }

    private static void BuildTreeNode(TreeNode<DiagramToolboxItem> node)
    {
        var data = node.Data;
        node.Label = new Text(data.Name);
        node.Icon = new Icon(data.Icon);
        node.IsLeaf = true;
        node.IsExpanded = true;
    }

    private void OnSelectionChanged() => SelectedItem = _treeController.FirstSelectedNode?.Data;

    public void ClearSelectedItem() => _treeController.ClearSelection();
}