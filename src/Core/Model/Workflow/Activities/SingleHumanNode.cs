namespace AppBoxCore;

/// <summary>
/// 单人活动模型
/// </summary>
public sealed class SingleHumanNode : HumanNode
{
    public SingleHumanNode()
    {
        Title = "单人活动";
    }

    /// <summary>
    /// Only for test
    /// </summary>
    internal SingleHumanNode(string title, ConditionLink[] conditions)
    {
        Title = title;
        ResultConditions.AddRange(conditions);
    }

    public override byte Type => ActivityType.SingleHumanActivity;

    public override bool IsSingleHuman => true;
}