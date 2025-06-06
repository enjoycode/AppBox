using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
        Height = 430;

        _element = element;
        _eventMeta = eventMeta;
        _treeController.SelectionChanged += OnSelectNode;
    }

    private readonly DesignElement _element;
    private readonly DynamicEventMeta _eventMeta;
    private readonly TreeController<ActionNode> _treeController = new();
    private DynamicView _editorView = null!;
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
                    Width = 200,
                    Child = new TreeView<ActionNode>(_treeController, BuildTreeNode, d => d.Children)
                },
                new Card
                {
                    Child = new DynamicView().RefBy(ref _editorView)
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

    protected override void OnMounted()
    {
        base.OnMounted();
        FetchTreeDataSource();
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
        if (_element.Data.TryGetEventValue(_eventMeta.Name, out var eventValue))
        {
            var exists = _treeController.FindNode(
                n => !n.IsGroup && n.EventActionInfo.ActionName == eventValue.Action.ActionName);
            if (exists != null)
                _treeController.SelectNode(exists);
        }
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
            _currentAction = _element.Data.TryGetEventValue(_eventMeta.Name, out var eventValue)
                ? eventValue.Action
                : DynamicWidgetManager.EventActionManager.Create(actionName);
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

    private void SwitchActionEditor(Widget? editor) => _editorView.ReplaceTo(editor);

    protected override ValueTask<bool> OnClosing(string result)
    {
        if (result != DialogResult.OK || _currentAction == null) return new ValueTask<bool>(false);

        _element.Data.SetEventValue(_eventMeta.Name, _currentAction);
        return new ValueTask<bool>(false);
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