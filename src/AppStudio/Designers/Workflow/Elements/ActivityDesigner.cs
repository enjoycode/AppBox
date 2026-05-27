using AppBoxCore;
using AppBoxDesign.Diagram;
using AppBoxDesign.Workflow;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class ActivityDesigner : DiagramShape, IDiagramItemDesigner
{
    public ActivityDesigner(ActivityNode node)
    {
        Node = node;
        if (node is StartNode)
            SetBounds(node.X, node.Y, 30, 30, BoundsSpecified.Size);
        else
            SetBounds(node.X, node.Y, Node.W, Node.H, BoundsSpecified.All);
    }

    public ActivityNode Node { get; }

    public override string TypeName => Node switch
    {
        StartNode => "StartActivity",
        DecisionNode => "DecisionActivity",
        AutomationNode => "AutomationActivity",
        SingleHumanNode => "SingleHumanActivity",
        MultiHumanNode => "MultiHumanActivity",
        _ => base.TypeName
    };

    public override DesignBehavior DesignBehavior
    {
        get
        {
            if (Node is StartNode) return DesignBehavior.CanMove;
            return DesignBehavior.CanMove | DesignBehavior.CanResize;
        }
    }

    protected override void OnCreated()
    {
        base.OnCreated();

        //设为默认大小
        var defaultSize = new Size(80, 40);
        SetBounds(Node.X, Node.Y, defaultSize.Width, defaultSize.Height, BoundsSpecified.Size);
    }

    protected override void SetBounds(float x, float y, float width, float height, BoundsSpecified specified)
    {
        //同步模型的坐标
        if (specified.HasFlag(BoundsSpecified.X))
            Node.X = x;
        if (specified.HasFlag(BoundsSpecified.Y))
            Node.Y = y;
        if (specified.HasFlag(BoundsSpecified.Width))
            Node.W = width;
        if (specified.HasFlag(BoundsSpecified.Height))
            Node.H = height;

        base.SetBounds(x, y, width, height, specified);

        //刷新属性面板的布局属性
        (Surface?.DiagramService as WorkflowDiagramService)?.PropertyPanel.RefreshLayoutProperties();
    }

    protected override void OnAddToSurface()
    {
        base.OnAddToSurface();
        Invalidate();
    }

    protected override void OnRemoveFromSurface()
    {
        //判断连接至当前模型实例的，打断连接
        var links = Surface!.GetConnections();
        for (var i = 0; i < links.Count; i++)
        {
            if (links[i].Source == this)
            {
                //暂直接删除连接线，由连接线的OnRemoveFromSurface处理相关逻辑
                if (links[i] is DiagramItem designer)
                    designer.Remove();
                else
                    links[i].Source = null;
            }
            else if (links[i].Target == this)
            {
                links[i].Target = null;
            }
        }

        base.OnRemoveFromSurface();
    }

    // protected override void Invalidate()
    // {
    //     if (this.Surface != null)
    //         this.Surface.Invalidate(Rect.Ceiling(Rect.Inflate(this.Bounds, 1f, 1f)));
    // }

    public override bool CanConnect(bool isStartPoint, IConnection connection)
    {
        if (isStartPoint)
        {
            if (connection.Target != null && connection.Target == this)
                return false;

            if (!Node.GetAvailableOutLinks().Any())
                return false;
        }
        else
        {
            if (Node is StartNode) //暂用此判断排除开始节点，即开始节点不允许接入
                return false;

            if (connection.Source != null && connection.Source == this)
                return false;
        }

        return true;
    }

    void IDiagramItemDesigner.Invalidate() => Invalidate();

    #region ====GetProperties====

    /// <summary>
    /// 获取布局属性组
    /// </summary>
    private DiagramPropertyGroup GetLayoutPropertyGroup()
    {
        var length = Node is StartNode ? 2 : 4;
        var properties = new IDiagramProperty[length];
        properties[0] = new DiagramProperty(this, "X", BoundsEditor.Factory)
        {
            ValueGetter = () => Location.X,
            ValueSetter = v => SetBounds((float)v!, Location.Y, Bounds.Width, Bounds.Height, BoundsSpecified.X)
        };
        properties[1] = new DiagramProperty(this, "Y", BoundsEditor.Factory)
        {
            ValueGetter = () => Location.Y,
            ValueSetter = v => SetBounds(Location.X, (float)v!, Bounds.Width, Bounds.Height, BoundsSpecified.Y)
        };
        if (Node is not StartNode)
        {
            properties[2] = new DiagramProperty(this, "Width", BoundsEditor.Factory)
            {
                ValueGetter = () => Bounds.Width,
                ValueSetter = v => SetBounds(Location.X, Location.Y, (float)v!, Bounds.Height, BoundsSpecified.Width)
            };
            properties[3] = new DiagramProperty(this, "Height", BoundsEditor.Factory)
            {
                ValueGetter = () => Bounds.Height,
                ValueSetter = v => SetBounds(Location.X, Location.Y, Bounds.Width, (float)v!, BoundsSpecified.Height)
            };
        }

        return new DiagramPropertyGroup() { GroupName = "Layout", Properties = properties };
    }

    private DiagramPropertyGroup GetDecisionPropertyGroup()
    {
        var titleProperty = new DiagramProperty(this, "Title", TextEditor.Factory)
        {
            ValueGetter = () => Node.Title,
            ValueSetter = v => Node.Title = v?.ToString() ?? string.Empty
        };

        return new DiagramPropertyGroup() { GroupName = "Properties", Properties = [titleProperty] };
    }

    private DiagramPropertyGroup GetAutomationPropertyGroup()
    {
        var titleProperty = new DiagramProperty(this, "Title", TextEditor.Factory)
        {
            ValueGetter = () => Node.Title,
            ValueSetter = v => Node.Title = v?.ToString() ?? string.Empty
        };

        return new DiagramPropertyGroup() { GroupName = "Properties", Properties = [titleProperty] };
    }

    private DiagramPropertyGroup GetHumanPropertyGroup()
    {
        var titleProperty = new DiagramProperty(this, "Title", TextEditor.Factory)
        {
            ValueGetter = () => Node.Title,
            ValueSetter = v => Node.Title = v?.ToString() ?? string.Empty
        };

        var actionProperty = new DiagramProperty(this, "Action", HumanActionEditor.Factory)
        {
            ValueGetter = () => ((HumanNode)Node).Actions,
        };

        return new DiagramPropertyGroup() { GroupName = "Properties", Properties = [titleProperty, actionProperty] };
    }

    public IEnumerable<DiagramPropertyGroup> GetProperties()
    {
        yield return GetLayoutPropertyGroup();

        switch (Node)
        {
            case DecisionNode:
                yield return GetDecisionPropertyGroup();
                break;
            case AutomationNode:
                yield return GetAutomationPropertyGroup();
                break;
            case SingleHumanNode:
            case MultiHumanNode:
                yield return GetHumanPropertyGroup();
                break;
        }
    }

    #endregion

    public override void Paint(ICanvas canvas)
    {
        switch (Node)
        {
            case StartNode:
                ActivityPainter.PaintStartActivity(canvas, Bounds.Size);
                break;
            case DecisionNode:
                ActivityPainter.PaintDecisionActivity(canvas, Bounds.Size, Node.Title);
                break;
            case AutomationNode:
                ActivityPainter.PaintAutomationActivity(canvas, Bounds.Size, Node.Title);
                break;
            case SingleHumanNode:
                ActivityPainter.PaintSingleHumanActivity(canvas, Bounds.Size, Node.Title);
                break;
            case MultiHumanNode:
                ActivityPainter.PaintMultiHumanActivity(canvas, Bounds.Size, Node.Title);
                break;
            default:
                base.Paint(canvas);
                break;
        }
    }
}