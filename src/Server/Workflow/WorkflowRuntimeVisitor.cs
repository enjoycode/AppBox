using System.Collections.ObjectModel;
using AppBoxCore;

namespace AppBox.Workflow;

public readonly struct WorkflowRuntimeVisitor
{
    public WorkflowRuntimeVisitor() { }

    private readonly Dictionary<ActivityNode, Activity> _hasVisits = new();

    public Activity Visit(ActivityNode node)
    {
        if (_hasVisits.TryGetValue(node, out var exists))
            return exists;

        //创建相应的Activity，并加入字典表
        var activity = ActivityFactory.Make(node.Type);
        activity.InitActivity(node);
        _hasVisits.Add(node, activity);

        //处理连接
        foreach (var (index, link) in node.GetOutLinks().Index())
        {
            VisitLink(activity, link, index);
        }

        return activity;
    }

    private void VisitLink(Activity source, FlowLink link, int index)
    {
        if (link.Target != null)
        {
            if (!_hasVisits.TryGetValue(link.Target, out var target))
                target = Visit(link.Target);

            //设置连接
            source.LinkTo(target, link, index);
        }
    }
}