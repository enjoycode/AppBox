using System.Collections.ObjectModel;
using AppBoxCore;

namespace AppBox.Workflow;

public static class ActivityFactory
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

    public static Activity Make(byte type)
    {
        if (!Factory.TryGetValue(type, out var factory))
            throw new Exception($"Can't find activity factory: {type}");

        return factory();
    }
}