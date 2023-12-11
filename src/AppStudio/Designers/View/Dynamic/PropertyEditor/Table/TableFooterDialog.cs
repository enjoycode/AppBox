using System;
using System.Collections.Generic;
using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

using TreeNodeType = TreeNode<TableFooterCell>;

internal sealed class TableFooterDialog : Dialog
{
    public TableFooterDialog(List<TableFooterCell> list)
    {
        Title.Value = "Cartesian Series";
        Width = 580;
        Height = 400;

        _treeController.DataSource = list;
        _treeController.SelectionChanged += OnSelectedTreeNode;
    }

    private readonly TreeController<TableFooterCell> _treeController = new();
    private readonly RxObject<TableFooterCell> _current = new();

    #region ====Build Widget Tree====

    private static void BuildTreeNode(TreeNodeType node)
    {
        var s = node.Data;
        node.IsExpanded = true;
        node.IsLeaf = true;
        node.Label = new Text(s.Observe(nameof(s.Type), () => s.Type.ToString()));
        node.Icon = new(MaterialIcons.Functions);
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
            new ButtonGroup
            {
                Children =
                {
                    new Button(icon: MaterialIcons.Add) { OnTap = _ => OnAdd() },
                    new Button(icon: MaterialIcons.Remove) { OnTap = _ => OnRemove() },
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
                Child = new TreeView<TableFooterCell>(_treeController, BuildTreeNode,
                    _ => Array.Empty<TableFooterCell>())
            },

            new Expanded(new Card { Child = new Container { Child = new TableFooterEditor(_current) } }),
        }
    };

    #endregion

    private void OnSelectedTreeNode()
    {
        var node = _treeController.FirstSelectedNode;
        _current.Target = node == null ? new TableFooterCell() : node.Data;
    }

    private void OnAdd()
    {
        var newNode = _treeController.InsertNode(new TableFooterCell());
        _treeController.SelectNode(newNode);
    }

    private void OnRemove()
    {
        var currentNode = _treeController.FirstSelectedNode;
        if (currentNode == null) return;

        _treeController.RemoveNode(currentNode);
    }
}