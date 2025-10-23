using System.Collections.Generic;
using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditors;

using TreeNodeType = TreeNode<TableColumnSettings>;

internal sealed class TableColumnsDialog : Dialog
{
    public TableColumnsDialog(List<TableColumnSettings> list, DesignElement element)
    {
        Title.Value = "Table Columns";
        Width = 580;
        Height = 425;

        _element = element;
        _treeController.DataSource = list;
        _treeController.SelectionChanged += OnSelectedTreeNode;
    }

    private readonly DesignElement _element;

    private readonly TreeController<TableColumnSettings> _treeController = new();
    private readonly State<string?> _typeName = "Text";

    private readonly State<TreeNodeType?> _currentNode = State<TreeNodeType?>.Default();
    private readonly RxObject<TextColumnSettings> _currentText = new();
    private readonly RxObject<GroupColumnSettings> _currentGroup = new();
    private readonly RxObject<RowNumColumnSettings> _currentRowNum = new();

    #region ====Build Widget Tree====

    private static void BuildTreeNode(TreeNodeType node)
    {
        var s = node.Data;
        node.IsExpanded = true;
        node.IsLeaf = s is not GroupColumnSettings;
        node.Label = new Text(s.Observe(nameof(s.Label), () => s.Label));
        node.Icon = s switch
        {
            TextColumnSettings => new(MaterialIcons.Title),
            RowNumColumnSettings => new(MaterialIcons.FormatListNumbered),
            GroupColumnSettings => new(MaterialIcons.ViewQuilt),
            _ => new(MaterialIcons.List)
        };
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

    private Row BuildToolbar() => new(spacing: 5)
    {
        Children =
        {
            new Select<string>(_typeName)
            {
                Width = 180,
                Options = new[] { TableColumnSettings.Text, TableColumnSettings.Group, TableColumnSettings.RowNum }
            },
            new ButtonGroup
            {
                Children =
                {
                    new Button(icon: MaterialIcons.Add) { OnTap = _ => OnAddColumn() },
                    new Button(icon: MaterialIcons.Remove) { OnTap = _ => OnRemoveColumn() },
                }
            }
        }
    };

    private Row BuildContent() => new(VerticalAlignment.Top)
    {
        Children =
        {
            new Card
            {
                Width = 250,
                Child = new TreeView<TableColumnSettings>(_treeController, BuildTreeNode,
                    s => ((GroupColumnSettings)s).Children)
                {
                    AllowDrag = true,
                    AllowDrop = true,
                    OnAllowDrag = OnAllowDrag,
                    OnAllowDrop = OnAllowDrop,
                    OnDrop = OnDrop
                }
            },

            new Expanded(new Card
                {
                    Child = new Container
                    {
                        Child = new Conditional<TreeNodeType?>(_currentNode)
                            .When(r => r?.Data.Type == TableColumnSettings.Text,
                                () => new TextColumnEditor(_currentText, _element))
                            .When(r => r?.Data.Type == TableColumnSettings.Group,
                                () => new TableColumnEditor<GroupColumnSettings>(_currentGroup, _element))
                            .When(r => r?.Data.Type == TableColumnSettings.RowNum,
                                () => new TableColumnEditor<RowNumColumnSettings>(_currentRowNum, _element))
                    }
                }
            ),
        }
    };

    #endregion

    protected override void OnMounted()
    {
        base.OnMounted();
        // 默认选中第一个节点
        if (_treeController.RootNodes.Length > 0)
            _treeController.SelectNode(_treeController.RootNodes[0]);
    }

    private void OnSelectedTreeNode()
    {
        var node = _treeController.FirstSelectedNode;
        var type = node?.Data.Type;
        switch (type)
        {
            case TableColumnSettings.Text:
                _currentText.Target = (TextColumnSettings)node!.Data;
                break;
            case TableColumnSettings.Group:
                _currentGroup.Target = (GroupColumnSettings)node!.Data;
                break;
            case TableColumnSettings.RowNum:
                _currentRowNum.Target = (RowNumColumnSettings)node!.Data;
                break;
        }

        _currentNode.Value = node;
    }

    private void OnAddColumn()
    {
        if (string.IsNullOrEmpty(_typeName.Value)) return;

        TableColumnSettings? newColumn = _typeName.Value switch
        {
            TableColumnSettings.Text => new TextColumnSettings { Label = "标题" },
            TableColumnSettings.Group => new GroupColumnSettings { Label = "标题" },
            TableColumnSettings.RowNum => new RowNumColumnSettings
                { Label = "行号", HorizontalAlignment = HorizontalAlignment.Center },
            _ => null
        };

        if (newColumn == null) return;

        TreeNodeType? parentNode = null;
        var insertIndex = -1;
        var currentNode = _currentNode.Value;
        if (currentNode != null)
        {
            if (currentNode.Data is GroupColumnSettings)
                parentNode = currentNode;
            else
            {
                parentNode = currentNode.ParentNode;
                if (parentNode != null)
                    insertIndex = parentNode.IndexOf(currentNode) + 1;
            }
        }

        var newNode = _treeController.InsertNode(newColumn, parentNode, insertIndex);
        _treeController.SelectNode(newNode);
    }

    private void OnRemoveColumn()
    {
        var currentNode = _currentNode.Value;
        if (currentNode == null) return;

        _treeController.RemoveNode(currentNode);
    }

    private static bool OnAllowDrag(TreeNodeType node) => true;

    private static bool OnAllowDrop(TreeNodeType target, DragEvent e)
    {
        if (e.DropPosition == DropPosition.In && target.Data.Type != TableColumnSettings.Group)
            return false;
        return true;
    }

    private void OnDrop(TreeNodeType target, DragEvent e)
    {
        var source = e.TransferItem as TreeNodeType;
        if (source == null) return;

        var isCurrent = source.IsSelected.Value;
        if (e.DropPosition == DropPosition.In)
        {
            _treeController.RemoveNode(source);
            var newNode = _treeController.InsertNode(source.Data, target);
            if (isCurrent)
                _treeController.SelectNode(newNode);
        }
        else if (e.DropPosition == DropPosition.Upper)
        {
            _treeController.RemoveNode(source);
            var index = target.Index;
            var newNode = _treeController.InsertNode(source.Data, target.ParentNode, index);
            if (isCurrent)
                _treeController.SelectNode(newNode);
        }
        else if (e.DropPosition == DropPosition.Under)
        {
            _treeController.RemoveNode(source); //must remove first
            var index = target.Index + 1;
            var newNode = _treeController.InsertNode(source.Data, target.ParentNode, index);
            if (isCurrent)
                _treeController.SelectNode(newNode);
        }
    }
}