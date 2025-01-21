using System;
using System.Collections.Generic;
using PixUI;

namespace AppBoxDesign;

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
    private Action? _refreshOutlineAction;
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
    internal Action? RefreshOutlineAction
    {
        get => _refreshOutlineAction;
        set => _refreshOutlineAction = value;
    }

    public void Invalidate() => _invalidateAction?.Invoke();

    public WidgetTreeNode? GetWidgetTree() => CurrentWidget == null ? null : new WidgetTreeNode(CurrentWidget);
}