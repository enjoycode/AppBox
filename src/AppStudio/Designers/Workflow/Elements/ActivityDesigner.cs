using AppBoxCore;
using AppBoxDesign.Diagram;
using AppBoxDesign.Workflow;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class ActivityDesigner : DiagramShape, IDiagramItemDesigner
{
    public ActivityDesigner(ActivityModel model)
    {
        _model = model;
        SetBounds(model.X, model.Y, 0f, 0f, BoundsSpecified.All); //todo: check it

        if (_model is HumanActivityModel humanActivityModel)
            humanActivityModel.ActionsChanging += OnHumanActionsChanging;
    }

    private readonly ActivityModel _model;

    public ActivityModel Model => _model;

    public override string TypeName => _model switch
    {
        StartActivityModel => "StartActivity",
        DecisionActivityModel => "DecisionActivity",
        AutomationActivityModel => "AutomationActivity",
        SingleHumanActivityModel => "SingleHumanActivity",
        MultiHumanActivityModel => "MultiHumanActivity",
        _ => base.TypeName
    };

    protected override void SetBounds(float x, float y, float width, float height, BoundsSpecified specified)
    {
        //同步模型的坐标
        if (specified.HasFlag(BoundsSpecified.X) || specified.HasFlag(BoundsSpecified.Y))
        {
            _model.X = x;
            _model.Y = y;
        }

        var itemSize = GetItemSize();
        base.SetBounds(x, y, itemSize.Width, itemSize.Height, specified);

        //刷新属性面板的布局属性
        (Surface?.DiagramService as WorkflowDiagramService)?.PropertyPanel.RefreshLayoutProperties();
    }

    private Size GetItemSize()
    {
        //暂固定大小
        return _model switch
        {
            StartActivityModel => new(30, 30),
            // DecisionActivityModel => new(80, 40),
            // AutomationActivityModel => new(80, 40),
            // SingleHumanActivityModel => new(80, 40),
            // MultiHumanActivityModel => new(80, 40),
            _ => new(80, 40)
        };
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
        for (int i = 0; i < links.Count; i++)
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

        if (_model is HumanActivityModel humanActivityModel)
            humanActivityModel.ActionsChanging -= OnHumanActionsChanging;

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

            var avaLinks = Model.GetAvailableOutLinks();
            if (avaLinks == null || avaLinks.Length == 0)
                return false;
        }
        else
        {
            if (Model is StartActivityModel) //暂用此判断排除开始节点，即开始节点不允许接入
                return false;

            if (connection.Source != null && connection.Source == this)
                return false;
        }

        return true;
    }

    /// <summary>
    /// 用于监测HumanActivity的ActionsChanged
    /// </summary>
    private void OnHumanActionsChanging(HumanActionsChangingEventArgs e)
    {
        var humanActivity = (HumanActivityModel)_model;
        if (humanActivity.IsSingleHuman) //单人活动
        {
            //1.处理删除的
            var deletes = e.OldActions.Except(e.NewActions).ToArray();
            if (deletes.Length > 0)
            {
                var connections = Surface!.GetConnections().Cast<ActivityConnection>();
                for (int i = 0; i < deletes.Length; i++)
                {
                    //1.1 找到对应的ConditionLink
                    var link = humanActivity.ResultConditions.SingleOrDefault(t => t.Name == deletes[i].OriginalName);
                    //1.2 从现有的连接线查找
                    var connection = connections.SingleOrDefault(t => t.Link == link);
                    if (connection != null)
                        connection.Remove();
                    //1.3 最后删除link
                    humanActivity.ResultConditions.Remove(link);
                }
            }

            //2.处理重命名的
            var renames = e.OldActions.Intersect(e.NewActions).Where(t => t.Name != t.OriginalName).ToArray();
            for (int i = 0; i < renames.Length; i++)
            {
                var link = humanActivity.ResultConditions.SingleOrDefault(t => t.Name == renames[i].OriginalName);
                link.Name = renames[i].Name;
                renames[i].AcceptChanges();
                //todo:通知刷新相应的连接线
            }

            //3.处理新添加的
            var adds = e.NewActions.Except(e.OldActions).ToArray();
            for (int i = 0; i < adds.Length; i++)
            {
                var link = new ConditionLink();
                link.Name = adds[i].Name;
                humanActivity.ResultConditions.Add(link);
            }
        }
        else //多人活动
        {
            //todo:需要判断删除的有没有在ResultConditions的表达式内引用到，有引用则不允许删除
            throw new NotImplementedException();
        }
    }

    void IDiagramItemDesigner.Invalidate() => Invalidate();

    /// <summary>
    /// 获取布局属性组
    /// </summary>
    private DiagramPropertyGroup GetLayoutPropertyGroup()
    {
        var properties = new IDiagramProperty[2];
        properties[0] = new DiagramProperty(this, "X", nameof(LocationEditor))
        {
            ValueGetter = () => Location.X,
            ValueSetter = v => Location = new Point((float)v!, Location.Y)
        };
        properties[1] = new DiagramProperty(this, "Y", nameof(LocationEditor))
        {
            ValueGetter = () => Location.Y,
            ValueSetter = v => Location = new Point(Location.X, (float)v!)
        };

        return new DiagramPropertyGroup() { GroupName = "Layout", Properties = properties };
    }

    public IEnumerable<DiagramPropertyGroup> GetProperties()
    {
        yield return GetLayoutPropertyGroup();
    }

    public override void Paint(ICanvas canvas)
    {
        switch (_model)
        {
            case StartActivityModel:
                ActivityPainter.PaintStartActivity(canvas, Bounds.Size);
                break;
            case DecisionActivityModel:
                ActivityPainter.PaintDecisionActivity(canvas, Bounds.Size, _model.Title);
                break;
            case AutomationActivityModel:
                ActivityPainter.PaintAutomationActivity(canvas, Bounds.Size, _model.Title);
                break;
            case SingleHumanActivityModel:
                ActivityPainter.PaintSingleHumanActivity(canvas, Bounds.Size, _model.Title);
                break;
            case MultiHumanActivityModel:
                ActivityPainter.PaintMultiHumanActivity(canvas, Bounds.Size, _model.Title);
                break;
            default:
                base.Paint(canvas);
                break;
        }
    }
}