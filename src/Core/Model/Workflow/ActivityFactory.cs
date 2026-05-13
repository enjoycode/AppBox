namespace AppBoxCore;

public static class ActivityType
{
    public const byte StartActivity = 0;
    public const byte AutomationActivity = 1;
    public const byte DecisionActivity = 2;
    public const byte SingleHumanActivity = 3;
    public const byte MultiHumanActivity = 4;
}

public static class ActivityFactory
{
    static ActivityFactory()
    {
        Register(ActivityType.StartActivity, () => new StartActivityModel());
        Register(ActivityType.AutomationActivity, () => new AutomationActivityModel());
        Register(ActivityType.DecisionActivity, () => new DecisionActivityModel());
        Register(ActivityType.SingleHumanActivity, () => new SingleHumanActivityModel());
        Register(ActivityType.MultiHumanActivity, () => new MultiHumanActivityModel());
    }

    private static readonly Dictionary<byte, Func<ActivityModel>> Map = [];

    public static ActivityModel Make(byte type)
    {
        if (Map.TryGetValue(type, out var factory))
            return factory();
        throw new Exception($"Unknown activity type: {type}");
    }

    public static void Register(byte type, Func<ActivityModel> factory)
    {
        if (!Map.TryAdd(type, factory))
            throw new Exception($"Activity type has exists: {type}");
    }
}