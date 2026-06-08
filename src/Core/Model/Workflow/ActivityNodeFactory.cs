namespace AppBoxCore;

public static class ActivityType
{
    public const byte StartActivity = 0;
    public const byte AutomationActivity = 1;
    public const byte DecisionActivity = 2;
    public const byte SingleHumanActivity = 3;
    public const byte MultiHumanActivity = 4;
    public const byte ForkActivity = 5;
    public const byte JoinActivity = 6;
}

public static class ActivityNodeFactory
{
    static ActivityNodeFactory()
    {
        Register(ActivityType.StartActivity, () => new StartNode());
        Register(ActivityType.AutomationActivity, () => new AutomationNode());
        Register(ActivityType.DecisionActivity, () => new DecisionNode());
        Register(ActivityType.SingleHumanActivity, () => new SingleHumanNode());
        Register(ActivityType.MultiHumanActivity, () => new MultiHumanNode());
    }

    private static readonly Dictionary<byte, Func<ActivityNode>> Map = [];

    public static ActivityNode Make(byte type)
    {
        if (Map.TryGetValue(type, out var factory))
            return factory();
        throw new Exception($"Unknown activity type: {type}");
    }

    public static void Register(byte type, Func<ActivityNode> factory)
    {
        if (!Map.TryAdd(type, factory))
            throw new Exception($"Activity type has exists: {type}");
    }
}