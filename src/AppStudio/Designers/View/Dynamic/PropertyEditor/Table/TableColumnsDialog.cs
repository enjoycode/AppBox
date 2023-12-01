using System.Collections.Generic;
using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

using TreeNodeType = TreeNode<TableColumnSettings>;

internal sealed class TableColumnsDialog : Dialog
{
    public TableColumnsDialog(List<TableColumnSettings> list, DesignElement element)
    {
        Title.Value = "Cartesian Series";
        Width = 580;
        Height = 400;

        _list = list;
        _element = element;

        _treeController.DataSource = _list;
        _treeController.SelectionChanged += OnSelectedTreeNode;
    }

    private readonly List<TableColumnSettings> _list;
    private readonly DesignElement _element;

    private readonly TreeController<TableColumnSettings> _treeController = new();
    private readonly State<string?> _typeName = "Text";

    private readonly State<TreeNodeType?> _currentNode = State<TreeNodeType?>.Default();
    private readonly RxObject<TextColumnSettings> _currentText = new();

    #region ====Build Widget Tree====

    private static void BuildTreeNode(TreeNode<TableColumnSettings> node)
    {
        var s = node.Data;
        node.IsExpanded = true;
        node.IsLeaf = true;
        node.Label = new Text(s.Observe(nameof(s.Label), () => s.Label));
        if (s is TextColumnSettings)
            node.Icon = new(MaterialIcons.Title);
    }

    protected override Widget BuildBody() => new Container
    {
        Padding = EdgeInsets.All(20),
        Child = new Column(alignment: HorizontalAlignment.Left, spacing: 5)
        {
            Children =
            {
                BuildToolbar(),
                BuildContent(),
            }
        }
    };

    private Row BuildToolbar() => new Row(spacing: 5)
    {
        Children =
        {
            new Select<string>(_typeName) { Width = 180, Options = new[] { "Text", "RowNum" } },
            new ButtonGroup
            {
                Children =
                {
                    new Button(icon: MaterialIcons.Add) { OnTap = _ => OnAddColumn() },
                    new Button(icon: MaterialIcons.Remove) /*{ OnTap = _ => OnRemoveSeries() }*/,
                    new Button(icon: MaterialIcons.ArrowUpward) /*{ OnTap = _ => OnMoveUp() }*/,
                    new Button(icon: MaterialIcons.ArrowDownward) /*{ OnTap = _ => OnMoveDown()*/
                }
            }
        }
    };

    private Row BuildContent() => new Row(VerticalAlignment.Top)
    {
        Children =
        {
            new Card
            {
                Width = 250,
                Child = new TreeView<TableColumnSettings>(_treeController)
                {
                    NodeBuilder = BuildTreeNode,
                    ChildrenGetter = s => new List<TableColumnSettings>()
                }
            },

            new Expanded(new Card
                {
                    Child = new Container
                    {
                        Child = new Conditional<TreeNodeType?>(_currentNode)
                            .When(r => r?.Data.Type == "Text",
                                () => new TextColumnEditor(_currentText, _element))
                        //         .When(r => r?.Type == "Column",
                        //             () => new ColumnSeriesEditor(_currentColumn, _dataGridController, _element))
                    }
                }
            ),
        }
    };

    #endregion

    private void OnSelectedTreeNode()
    {
        var node = _treeController.FirstSelectedNode;
        if (node?.Data.Type == "Text")
            _currentText.Target = (TextColumnSettings)node.Data;

        _currentNode.Value = node;
    }

    private void OnAddColumn()
    {
        if (string.IsNullOrEmpty(_typeName.Value)) return;

        TableColumnSettings? newColumn = _typeName.Value switch
        {
            "Text" => new TextColumnSettings() { Label = "标题" },
            _ => null
        };

        if (newColumn != null)
        {
            var newNode = _treeController.InsertNode(newColumn);
            _treeController.SelectNode(newNode);
        }
    }
}