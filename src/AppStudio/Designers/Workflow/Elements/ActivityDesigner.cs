using AppBoxCore;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class ActivityDesigner : DiagramShape
{
    public ActivityDesigner(ActivityModel model)
    {
        _model = model;
        // var typeName = model.GetType().Name;
        // this._painter = ActivityPainters.GetPainter(typeName.Remove(typeName.Length - 5));
        SetBounds(model.X, model.Y, 0f, 0f, BoundsSpecified.All); //todo: check it

        if (_model is HumanActivityModel humanActivityModel)
            humanActivityModel.ActionsChanging += OnHumanActionsChanging;
    }

    private readonly ActivityModel _model;

    public ActivityModel Model => _model;

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

    public override void Paint(ICanvas g)
    {
        base.Paint(g);
    }
}