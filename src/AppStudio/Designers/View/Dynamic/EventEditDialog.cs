using System;
using System.Collections.Generic;
using System.Linq;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign;

internal sealed class EventEditDialog : Dialog
{
    public EventEditDialog(DesignElement element, DynamicEventMeta eventMeta)
    {
        Title.Value = "Event Action Edit";
        Width = 580;
        Height = 400;

        _element = element;
        _eventMeta = eventMeta;
        _treeController.SelectionChanged += OnSelectNode;
        FetchTreeDataSource();
    }

    private readonly DesignElement _element;
    private readonly DynamicEventMeta _eventMeta;
    private readonly TreeController<ActionNode> _treeController = new();
    private readonly WidgetRef<DynamicView> _editorView = new();
    private IEventAction? _currentAction;

    protected override Widget BuildBody() => new Container
    {
        Padding = EdgeInsets.All(20),
        Child = new Row
        {
            Children =
            {
                new Card
                {
                    Width = 250,
                    Child = new TreeView<ActionNode>(_treeController, BuildTreeNode, d => d.Children)
                },
                new Card()
                {
                    Child = new DynamicView { Ref = _editorView }
                }
            }
        }
    };

    private static void BuildTreeNode(TreeNode<ActionNode> node)
    {
        node.Label = new Text(node.Data.Label);
        node.IsLeaf = !node.Data.IsGroup;
        node.IsExpanded = node.Data.IsGroup;
        node.Icon = node.Data.IsGroup ? new Icon(MaterialIcons.Folder) : new Icon(MaterialIcons.Bolt);
    }

    private void FetchTreeDataSource()
    {
        var groups = DynamicWidgetManager.EventActionManager
            .GetAll()
            .GroupBy(a => a.GroupName)
            .ToList();

        var nodes = new List<ActionNode>();
        foreach (var group in groups)
        {
            var children = group.Select(a => new ActionNode(a)).ToList();
            nodes.Add(new ActionNode(group.Key, children));
        }

        _treeController.DataSource = nodes;

        //尝试选中节点
        //TODO:
    }

    private void OnSelectNode()
    {
        var node = _treeController.FirstSelectedNode;
        if (node == null || node.Data.IsGroup)
        {
            SwitchActionEditor(null);
            return;
        }

        var actionName = node.Data.EventActionInfo.ActionName;
        try
        {
            _currentAction = DynamicWidgetManager.EventActionManager.Create(actionName);
        }
        catch (Exception)
        {
            Notification.Error($"Can't find event action: {actionName}");
            SwitchActionEditor(null);
            return;
        }

        if (!EventEditor.TryGetEditor(actionName, out var creator))
        {
            Notification.Error($"Can't find event editor: {actionName}");
            SwitchActionEditor(null);
            return;
        }

        var editor = creator(_element, _eventMeta, _currentAction);
        SwitchActionEditor(editor);
    }

    private void SwitchActionEditor(Widget? editor) => _editorView.Widget!.ReplaceTo(editor);

    protected override bool OnClosing(string result)
    {
        if (result != DialogResult.OK || _currentAction == null) return false;

        _element.Data.SetEventValue(_eventMeta.Name, _currentAction);
        return false;
    }

    #region ====ActionNode====

    private sealed class ActionNode
    {
        public ActionNode(string groupName, IList<ActionNode> children)
        {
            GroupName = groupName;
            Target = children;
        }

        public ActionNode(EventActionInfo actionInfo)
        {
            GroupName = null;
            Target = actionInfo;
        }

        public readonly string? GroupName;
        public readonly object? Target;

        public bool IsGroup => !string.IsNullOrEmpty(GroupName);
        public string Label => GroupName ?? ((EventActionInfo)Target!).ActionName;
        public IList<ActionNode> Children => (IList<ActionNode>)Target!;
        public EventActionInfo EventActionInfo => (EventActionInfo)Target!;
    }

    #endregion
}