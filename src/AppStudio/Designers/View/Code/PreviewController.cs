using PixUI;

namespace AppBoxDesign;

internal sealed class WidgetTreeNode
{
    public WidgetTreeNode(Widget widget)
    {
        Widget = widget;
        Children = new List<WidgetTreeNode>();
        var visitor = new WidgetTreeChildrenVisitor(Children);
        Widget.VisitChildren(ref visitor);
    }

    public readonly Widget Widget;
    public readonly List<WidgetTreeNode> Children;

    private readonly struct WidgetTreeChildrenVisitor : IChildrenVisitor
    {
        public WidgetTreeChildrenVisitor(List<WidgetTreeNode> children)
        {
            _children = children;
        }

        private readonly List<WidgetTreeNode> _children;

        public bool Visit(Widget child)
        {
            _children.Add(new WidgetTreeNode(child));
            return false;
        }
    }
}

/// <summary>
/// 视图模型的预览控制器
/// </summary>
internal sealed class PreviewController
{
    public PreviewController(ModelNode modelNode)
    {
        ModelNode = modelNode;
    }

    public readonly ModelNode ModelNode;
    private Action? _invalidateAction;
    internal Widget? CurrentWidget; //当前加载的预览的Widget实例

    /// <summary>
    /// 用于重新加载预览
    /// </summary>
    internal Action InvalidateAction
    {
        set => _invalidateAction = value;
    }

    /// <summary>
    /// 用于重新加载大纲视图
    /// </summary>
    internal Action? RefreshOutlineAction { get; set; }

    public void Invalidate() => _invalidateAction?.Invoke();

    public WidgetTreeNode? GetWidgetTree() => CurrentWidget == null ? null : new WidgetTreeNode(CurrentWidget);
}