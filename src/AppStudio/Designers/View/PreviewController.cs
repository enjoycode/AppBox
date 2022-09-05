using System;
using System.Collections.Generic;
using PixUI;

namespace AppBoxDesign;

[TSNoInitializer]
internal sealed class WidgetTreeNode
{
    public WidgetTreeNode(Widget widget)
    {
        Widget = widget;
        Children = new List<WidgetTreeNode>();
        Widget.VisitChildren(child =>
        {
            Children.Add(new WidgetTreeNode(child));
            return false;
        });
    }

    public readonly Widget Widget;
    public readonly IList<WidgetTreeNode> Children;
}

[TSNoInitializer]
internal sealed class PreviewController
{
    public PreviewController(ModelNodeVO modelNode)
    {
        ModelNode = modelNode;
    }

    public readonly ModelNodeVO ModelNode;
    private Action? _invalidateAction;
    internal Widget? CurrentWidget; //当前加载的预览的Widget实例

    internal Action InvalidateAction
    {
        set => _invalidateAction = value;
    }

    public void Invalidate() => _invalidateAction?.Invoke();

    public WidgetTreeNode? GetWidgetTree() =>
        CurrentWidget == null ? null : new WidgetTreeNode(CurrentWidget);
}