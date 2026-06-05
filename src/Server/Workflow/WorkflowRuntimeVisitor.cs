using System.Collections.ObjectModel;
using AppBoxCore;

namespace AppBox.Workflow;

public readonly struct WorkflowRuntimeVisitor
{
    private static readonly ReadOnlyDictionary<byte, Func<Activity>> Factory = new(
        new Dictionary<byte, Func<Activity>>()
        {
            { ActivityType.StartActivity, () => new StartActivity() },
            { ActivityType.DecisionActivity, () => new DecisionActivity() },
            { ActivityType.AutomationActivity, () => new AutomationActivity() },
            { ActivityType.SingleHumanActivity, () => new SingleHumanActivity() },
            { ActivityType.MultiHumanActivity, () => new MultiHumanActivity() },
        }
    );

    public WorkflowRuntimeVisitor() { }

    private readonly Dictionary<ActivityNode, Activity> _hasVisits = new();

    public Activity? Visit(ActivityNode node)
    {
        if (_hasVisits.ContainsKey(node))
            return null;

        //创建相应的Activity，并加入字典表
        if (!Factory.TryGetValue(node.Type, out var creator))
            throw new Exception($"Can not find Activity for: {node.GetType()}");
        var activity = creator();
        activity.InitActivity(node);
        _hasVisits.Add(node, activity);

        //处理连接
        foreach (var link in node.GetOutLinks())
        {
            VisitLink(activity, link);
        }

        return activity;
    }

    private void VisitLink(Activity source, FlowLink link)
    {
        if (link.Target != null)
        {
            if (!_hasVisits.TryGetValue(link.Target, out var target))
                target = Visit(link.Target);

            //设置连接
            source.LinkTo(target!, link);
        }
    }
}